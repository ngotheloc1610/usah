import { memo, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { wsService } from "../../../services/websocket-service";
import * as tspb from "../../../models/proto/trading_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import * as qspb from "../../../models/proto/query_service_pb"

import { IListOrderModifyCancel, IListPendingOrder, IParamOrderModifyCancel } from "../../../interfaces/order.interface";
import { ACCOUNT_ID, LIST_TICKER_ALL, MESSAGE_TOAST, ORDER_TYPE, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED, SOCKET_RECONNECTED, START_PAGE, TITLE_CONFIRM, SORT_MODIFY_CANCEL_SCREEN, TEAM_CODE } from "../../../constants/general.constant";
import { DEFAULT_ITEM_PER_PAGE } from '../../../constants/order.constant';
import { calcPendingVolume, formatCurrency, formatNumber, formatOrderTime, checkMessageError, convertNumber, sortDateTime, sortPrice, sortSide, sortTicker, defindConfigPost, renderCurrentList } from "../../../helper/utils";
import { TYPE_ORDER_RES } from "../../../constants/order.constant";
import { DEFAULT_DATA_MODIFY_CANCEL } from "../../../mocks";
import { API_GET_PENDING_ORDER } from "../../../constants/api.constant";
import { IParamPendingOrder } from "../../../interfaces";
import { success, unAuthorised } from "../../../constants";

import PaginationComponent from "../../../Common/Pagination";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import PopUpConfirm from "../../Modal/PopUpConfirm";
import "./ListModifyCancel.css";

interface IPropsListModifyCancel {
    orderSide: number;
    symbolCode: string;
    orderType: number;
    isSearch: boolean;
    resetIsSearch: (value: boolean) => void;
    paramSearch: IParamPendingOrder;
    handleUnAuthorisedAcc:(value: boolean) => void;
}

const ListModifyCancel = (props: IPropsListModifyCancel) => {
    const { 
        orderSide,
        symbolCode,
        orderType,
        paramSearch,
        isSearch,
        resetIsSearch,
        handleUnAuthorisedAcc
    } = props;

    const tradingModelPb: any = tspb;

    const [listOrderFull, setListOrderFull] = useState<IListOrderModifyCancel[]>([]);
    const [listPendingOrder, setListPendingOrder] = useState<IListPendingOrder[]>([]);
    const [listOrder, setListOrder] = useState<IListOrderModifyCancel[]>([]);
    const [dataOrder, setDataOrder] = useState<IListOrderModifyCancel[]>([]);
    const [statusOrder, setStatusOrder] = useState(0);
    const [isModify, setIsModify] = useState<boolean>(false);
    const [isCancel, setIsCancel] = useState<boolean>(false);
    const [statusModify, setStatusModify] = useState(0);
    
    const [paramModifyCancel, setParamModifyCancel] = useState<IParamOrderModifyCancel>(DEFAULT_DATA_MODIFY_CANCEL);
    const [isCancelAll, setIsCancelAll] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [dataSelected, setDataSelected] = useState<IListOrderModifyCancel[]>([]);
    const [dataSelectedList, setSelectedList] = useState<any[]>([]);
    const totalItem = listOrder.length;
    const [orderEventList, setOrderEventList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);


    const accountId = sessionStorage.getItem(ACCOUNT_ID) || '';

    const stateSortDefault = {
        feild: 'date',
        sortAsc: false,
        accountId: accountId
    }

    const stateSortList = JSON.parse(localStorage.getItem(SORT_MODIFY_CANCEL_SCREEN) || '[]')
    const index = stateSortList.findIndex(item => item.accountId === accountId)
    const stateSort = index >= 0 ? stateSortList[index] : stateSortDefault

    // sort ticker
    const [isTickerAsc, setIsTickerAsc] = useState(stateSort.field === 'ticker' ? stateSort.sortAsc : false);
    const [isSortTicker, setIsSortTicker] = useState(stateSort.field === 'ticker');

    // sort price
    const [isPriceAsc, setIsPriceAsc] = useState(stateSort.field === 'price' ? stateSort.sortAsc : false);
    const [isSortPrice, setIsSortPrice] = useState(stateSort.field === 'price');

    // sort orderSide
    const [isSideAsc, setIsSideAsc] = useState(stateSort.field === 'side' ? stateSort.sortAsc : false);
    const [isSortSide, setIsSortSide] = useState(stateSort.field === 'side');

    // sort dateTime
    const [isDateTimeAsc, setIsDateTimeAsc] = useState(stateSort.field === 'date' ? stateSort.sortAsc : false);
    const [isSortDateTime, setIsSortDateTime] = useState(stateSort.field ? stateSort.field === 'date' : true);

    const [cancelListId, setCancelListId] = useState<string[]>([]);

    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
    const teamCode = sessionStorage.getItem(TEAM_CODE) || ''
    
    const api_url = window.globalThis.apiUrl;

    const getDataPendingOrder = (param: IParamPendingOrder) => {
        const urlPendingOrder = `${api_url}${API_GET_PENDING_ORDER}`;
        
        axios.post(urlPendingOrder, paramSearch, defindConfigPost()).then((resp) => {
            if (resp?.status === success) {
                const resultData = resp?.data?.results;
                
                setListPendingOrder(resultData);
                handleUnAuthorisedAcc(false);
            }
        },
            (error: any) => {
                const msgCode = error.response.status
                if(msgCode === unAuthorised) {
                    setListPendingOrder([]);
                    handleUnAuthorisedAcc(true);
                }
        });
    }

    useEffect(() => {
        getDataPendingOrder(paramSearch);
    }, [JSON.stringify(paramSearch)])

    /* convert field API -> WS when callAPI get orderList */
    useEffect(() => {
        const listOrderConvert: IListOrderModifyCancel[] = []
        if(listPendingOrder.length > 0){
            listPendingOrder.forEach((item) => {
                listOrderConvert.push({
                    externalOrderId: item.external_order_id,
                    amount: item.volume.toString(),
                    entry: '',
                    executeMode: '',
                    expireTime: '',
                    fee: '',
                    note: '',
                    orderFilling: '',
                    orderId: item.order_id,
                    orderMode: 0,
                    orderTime: 0,
                    orderType: item.order_type,
                    pl: '',
                    price: item.price.toString(),
                    reason: '',
                    route: '',
                    side: item.order_side,
                    sl: '',
                    slippage: '',
                    state: '',
                    swap: '',
                    symbolCode: item.symbol_code,
                    time: item.exec_time,
                    tp: '',
                    triggerPrice: '',
                    uid: convertNumber(item.account_id),
                    filledAmount: item.exec_volume.toString(),
                })
            })
        }
        setListOrderFull(listOrderConvert);
    }, [listPendingOrder])
    
    useEffect(() => {
        let currentList: IListOrderModifyCancel[] = []
        if(isSortDateTime) {
            const listOrderSort: IListOrderModifyCancel[] = sortDateTime(listOrder, isDateTimeAsc)
            currentList = renderCurrentList(currentPage, itemPerPage, listOrderSort);
            setDataOrder(currentList);
        }

        if(isSortPrice) {
            const listOrderSort: IListOrderModifyCancel[] = sortPrice(listOrder, isPriceAsc)
            currentList = renderCurrentList(currentPage, itemPerPage, listOrderSort);
            setDataOrder(currentList);
        }
        if(isSortSide) {
            const listOrderSort: IListOrderModifyCancel[] = sortSide(listOrder, isSideAsc)
            currentList = renderCurrentList(currentPage, itemPerPage, listOrderSort);
            setDataOrder(currentList);
            setDataOrder(listOrderSort);
        }
        if(isSortTicker) {
            const listOrderSort: IListOrderModifyCancel[] = sortTicker(listOrder, isTickerAsc)
            currentList = renderCurrentList(currentPage, itemPerPage, listOrderSort);
            setDataOrder(currentList);
            setDataOrder(listOrderSort);
        }
        if (currentList.length === 0 && isSearch) {
            currentPage === START_PAGE ? setCurrentPage(START_PAGE) : setCurrentPage(currentPage - 1);
            if (resetIsSearch) {
                resetIsSearch(false);
            }
        }
    }, [listOrder, itemPerPage, currentPage])

    useEffect(() => {
        setCurrentPage(currentPage);
    }, [isCancel])

    useEffect(() => {
        if(isSearch) setCurrentPage(START_PAGE);
        if (resetIsSearch) {
            resetIsSearch(false);
        }
    }, [isSearch])
    
    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendListOrder();
            }
        });

        const orderEvent = wsService.getOrderEvent().subscribe(resp => {
            setOrderEventList(resp.orderList);
        })

        return () => {
            ws.unsubscribe();
            orderEvent.unsubscribe();
        }
    }, []);

    useEffect(() => {
        const orderIds = dataOrder.map((order) => order.orderId);
        const newSelectList = [...dataSelectedList] 

        dataSelectedList.forEach((item) => {
            if(!orderIds.includes(item)) {
                newSelectList.splice(newSelectList.indexOf(item), 1);
            }
        });
        setSelectedList(newSelectList);
    }, [dataOrder])

    useEffect(() => {
        processOrderList(listOrderFull);
    }, [listOrderFull, symbolCode, orderSide, orderType])

    useEffect(() => {
        processOrderEvent(orderEventList);
    }, [orderEventList]);

    const processOrderEvent = (orderList) => {
        if (orderList) {
            orderList.forEach(order => {
                switch (order.state) {
                    case tradingModelPb.OrderState.ORDER_STATE_PLACED: {
                        handleOrderPlaced(order);
                        break;
                    }
                    case tradingModelPb.OrderState.ORDER_STATE_CANCELED: {
                        handleOrderCanceledAndFilled(order);
                        break;
                    }
                    case tradingModelPb.OrderState.ORDER_STATE_PARTIAL: {
                        handleOrderParital(order);
                        break;
                    }
                    case tradingModelPb.OrderState.ORDER_STATE_FILLED: {
                        handleOrderCanceledAndFilled(order);
                        break;
                    }
                    case tradingModelPb.OrderState.ORDER_STATE_REJECTED: {
                        handleOrderRejected(order);
                        break;
                    }
                    case tradingModelPb.OrderState.ORDER_STATE_MODIFIED: {
                        handleOrderModified(order);
                        break;
                    }
                    case tradingModelPb.OrderState.ORDER_STATE_MATCHED: {
                        break;
                    }
                    default: {
                        console.log("Order state don't support. OrderState=", order.state);
                    }
                }
            })
        }
    }

    const handleOrderPlaced = (order) => {
        const tmpList = [...listOrderFull];
        const idx = tmpList.findIndex(o => o?.orderId === order.orderId);
        if (idx < 0) {
            tmpList.unshift({
                ...order,
                time: convertNumber(order?.executedDatetime)
    
            });
        } else {
            tmpList[idx] = {
                ...tmpList[idx],
                time: convertNumber(order?.executedDatetime),
                price: order?.price
            }
        }
        setListOrderFull(tmpList);
    }

    const handleOrderCanceledAndFilled = (order) => {
        if (order?.state === tradingModelPb.OrderState.ORDER_STATE_CANCELED) {
            const idx = cancelListId.indexOf(order?.orderId);
            if (idx >= 0) {
                cancelListId.splice(idx, 1)
            }
        }
        removeOrder(order);
    }

    const handleOrderParital = (order) => {
        const tmpList = [...listOrderFull];
        const idx = tmpList.findIndex(o => o?.orderId === order.orderId);
        let orderPrice = order?.price;
        if (order?.orderType === tradingModelPb.OrderType.OP_MARKET) {
            orderPrice = order?.entry === tradingModelPb.OrderEntry.ENTRY_IN ? order?.lastPrice : order.price;
        }
        if (idx >= 0) {
            tmpList[idx] = {
                ...tmpList[idx],
                time: convertNumber(order?.executedDatetime),
                amount: order?.amount,
                filledAmount: order?.totalFilledAmount,
                price: orderPrice
            }
        } else {
            tmpList.unshift({
                ...order,
                time: convertNumber(order?.executedDatetime),
            });
        }
        setListOrderFull(tmpList);
    }

    const handleOrderModified = (order) => {
        const tmpList = [...listOrderFull];
        const idx = tmpList.findIndex(o => o?.orderId === order.orderId);
        if (idx >= 0) {
            tmpList[idx] = {
                ...tmpList[idx],
                time: convertNumber(order?.executedDatetime),
                amount: order?.filledAmount,
                filledAmount: '0'
            }
            setListOrderFull(tmpList);
        }
    }

    const handleOrderRejected = (order) => {
        removeOrder(order);
    }

    const removeOrder = (order) => {
        const tmpList = [...listOrderFull];
        const idx = tmpList.findIndex(o => o?.orderId === order.orderId);
        if (idx >= 0) {
            tmpList.splice(idx, 1);
            setListOrderFull(tmpList);
        }
    }

    const processOrderList = (listOrder: IListOrderModifyCancel[]) => {
        let listOrderFilter: IListOrderModifyCancel[] = listOrder;
        if (symbolCode !== '') {
            listOrderFilter = listOrderFilter.filter(item => item.symbolCode === symbolCode);
        }
        if (orderSide !== 0) {
            listOrderFilter = listOrderFilter.filter(item => item.side === orderSide);
        }
        if (orderType !== tradingModelPb.OrderType.OP_NONE) {
            listOrderFilter = listOrderFilter.filter(item => item.orderType === orderType);
        }
        setListOrder(listOrderFilter);
    }

    const getItemPerPage = (item: number) => {
        setItemPerPage(item);
        setCurrentPage(START_PAGE)  
    }

    const getCurrentPage = (item: number) => {
        setCurrentPage(item); 
    }

    const sendListOrder = () => {
        let accountId = sessionStorage.getItem(ACCOUNT_ID) || '';
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();

            orderRequest.setAccountId(accountId);
            rpcMsg.setPayloadData(orderRequest.serializeBinary());

            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getTickerCode = (symbolCode: string): string => {
        return symbolsList.find(item => item.symbolCode === symbolCode)?.symbolCode || '';
    }

    const getTickerName = (symbolCode: string): string => {
        return symbolsList.find(item => item.symbolCode === symbolCode)?.symbolName || '';
    }

    const getSideName = (side: number) => {
        return SIDE.find(item => item.code === side)?.title;
    }

    const handleModifyCancel = (item: IListOrderModifyCancel, value: string) => {
        const param: IParamOrderModifyCancel = {
            orderId: item.orderId.toString(),
            tickerCode: getTickerCode(item.symbolCode),
            tickerName: getTickerName(item.symbolCode),
            orderType: item.orderType,
            volume: calcPendingVolume(item.amount, item.filledAmount).toString(),
            price: Number(item.price),
            side: item.side,
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
            uid: item.uid
        }
        setParamModifyCancel(param);
        if (value === TITLE_CONFIRM['modify']) {
            setIsModify(true);
            return;
        }
        setIsCancel(true);
    }

    const togglePopup = (isCloseModifyCancel: boolean) => {
        setIsModify(isCloseModifyCancel);
        setIsCancel(isCloseModifyCancel);
        setIsCancelAll(isCloseModifyCancel);
    }

    const _renderMessageSuccess = (message: string, typeOrderRes: string) => {
        // To handle when modify or cancel success then update new data without having to press f5
        switch(typeOrderRes) {
            case TYPE_ORDER_RES.Order:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
            case TYPE_ORDER_RES.Modify:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_MODIFY)}</div>
            case TYPE_ORDER_RES.Cancel:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_CANCEL)}</div>
        }
    }

    const _renderMessageError = (message: string, msgCode: number) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.error(messageDis)}</div>
    }

    const _renderMessageWarning = (message: string, msgCode) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.warning(messageDis)}</div>
    }

    const getStatusOrderResponse = (value: number, content: string, typeOrderRes: string, msgCode: number) => {
        if (typeOrderRes === TYPE_ORDER_RES.Order && statusOrder === 0) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(content, typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
                
            </>
        }
        if (typeOrderRes === TYPE_ORDER_RES.Cancel) {
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(content, typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        if (typeOrderRes === TYPE_ORDER_RES.Modify && statusModify === 0) {
            setStatusModify(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(content, typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        return <></>;
    }

    const btnCancelAllConfirm = () => {
        const dataSelected = dataOrder.filter(item => dataSelectedList.includes(item.orderId));
        setDataSelected(dataSelected);
        setIsCancelAll(true);
        setTotalOrder(dataSelected.length);
    }

    const handleChecked = (event: any, item: any) => {
        if (item) {
            const temps = [...dataSelectedList];
            const idx = temps.findIndex(o => o === item.orderId);
            if (event.target.checked) {
                if (idx < 0) {
                    temps.push(item.orderId);
                }
            } else {
                if (idx >= 0) {
                    temps.splice(idx, 1);
                }
            }
            setSelectedList(temps);
        }

    }

    const handleCheckedAll = (event: any) => {
        let lst: string[] = [];
        if (event.target.checked) {
            dataOrder.forEach(item => {
                lst.push(item.orderId);
            });
        }
        setSelectedList(lst);
    }

    const checkOrderExistListCancelId = (orderId: string) => {
        return cancelListId.indexOf(orderId) >= 0;
    }

    const getOrderCancelId = (orderId: string) => {
        const idx = cancelListId.indexOf(orderId);
        if (orderId !== '' && orderId !== null && orderId !== undefined && idx < 0) {
            cancelListId.push(orderId);
        }
        setCancelListId(cancelListId);
    }

    const getOrderCancelIdResponse = (orderId: string) => {
        const idx = cancelListId.indexOf(orderId);
        if (idx >= 0) {
            cancelListId.splice(idx, 1);
        }
        setCancelListId(cancelListId);
        setSelectedList([]);
    }

    
    const handleSortTicker = () => {
        setIsSortTicker(true);
        setIsSortPrice(false);
        setIsSortSide(false);
        setIsSortDateTime(false);
        const temp = [...dataOrder];
        const stateSortTmp = {
            field: 'ticker',
            sortAsc: !isTickerAsc,
            accountId: accountId
        }

        if(index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MODIFY_CANCEL_SCREEN, JSON.stringify(stateSortList))
        const tmp = sortTicker(temp, !isTickerAsc)
        setDataOrder(tmp);
        setIsTickerAsc(isTickerAsc ? false : true);
    }

    const handleSortDateTime = () => {
        setIsSortTicker(false);
        setIsSortPrice(false);
        setIsSortSide(false);
        setIsSortDateTime(true);
        const temp = [...dataOrder];
        const stateSortTmp = {
            field: 'date',
            sortAsc: !isDateTimeAsc,
            accountId: accountId
        }

        if(index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MODIFY_CANCEL_SCREEN, JSON.stringify(stateSortList))

        const tmp = sortDateTime(temp, !isDateTimeAsc)
        setDataOrder(tmp);
        setIsDateTimeAsc(isDateTimeAsc ? false : true);
    }

    const handleSortSide = () => {
        setIsSortTicker(false);
        setIsSortPrice(false);
        setIsSortDateTime(false);
        setIsSortSide(true);
        const temp = [...dataOrder];
        const stateSortTmp = {
            field: 'side',
            sortAsc: !isSideAsc,
            accountId: accountId
        }
        if(index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MODIFY_CANCEL_SCREEN, JSON.stringify(stateSortList))
        const tmp = sortSide(temp, !isSideAsc)
        setDataOrder(tmp);
        setIsSideAsc(isSideAsc ? false : true);
    }

    const handleSortPrice = () => {
        setIsSortTicker(false);
        setIsSortDateTime(false);
        setIsSortSide(false);
        setIsSortPrice(true);
        const temp = [...dataOrder];
        const stateSortTmp = {
            field: 'price',
            sortAsc: !isPriceAsc,
            accountId: accountId
        }
        if(index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MODIFY_CANCEL_SCREEN, JSON.stringify(stateSortList))
        
        const tmp = sortPrice(temp, !isPriceAsc)
        setDataOrder(tmp);
        setIsPriceAsc(isPriceAsc ? false : true);
    }

    const getListModifyCancelData = () => (
        dataOrder.map((item, index) => {
            return <tr key={index} className="odd">
                <td>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" value=""
                            checked={dataSelectedList.includes(item.orderId)}
                            name={index.toString()}
                            onChange={(event) => handleChecked(event, item)}
                            id="all" />
                    </div>
                </td>
                {teamCode && teamCode !== 'null' &&  <td className="fm">{item.uid}</td>}
                <td className="fm">{item.externalOrderId}</td>
                <td title={getTickerName(item.symbolCode)}>{getTickerCode(item.symbolCode.toString())}</td>
                <td className="text-center "><span className={`${item.side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.side)}</span></td>
                <td className="text-center ">{ORDER_TYPE.get(item.orderType)}</td>
                <td className="text-end ">{formatCurrency(item.price.toString())}</td>
                <td className="text-end ">{formatNumber(item.amount.toString())}</td>
                <td className="text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</td>
                <td className="text-end">{formatOrderTime(item.time)}</td>
                <td className="text-end">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a className="btn-edit-order mr-10" onClick={() => handleModifyCancel(item, TITLE_CONFIRM['modify'])}>
                        <i className="bi bi-pencil-fill"></i>
                    </a>

                    { !checkOrderExistListCancelId(item?.orderId) &&
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        <a onClick={() => handleModifyCancel(item, TITLE_CONFIRM['cancel'])}>
                            <i className="bi bi-x-lg"></i>
                        </a>
                    }
                    { checkOrderExistListCancelId(item?.orderId) &&
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="sr-only"></span>
                        </div>
                    }
                </td>
            </tr>
        })
    )
    return <div className="card-modify mb-3">
        <div className="card-body p-0 mb-3">
            <div className="table table-responsive mh-500 tableFixHead">
                <table className="table table-sm table-hover mb-0 dataTable no-footer">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" value=""
                                    name="allSelect"
                                    onChange={handleCheckedAll}
                                    checked={dataSelectedList.length === dataOrder.length && dataOrder.length > 0}
                                />
                            </th>
                            {teamCode && teamCode !== 'null' &&  <th className="sorting_disabled">
                                <span className="text-ellipsis">Account Id</span>
                            </th>}
                            <th className="sorting_disabled">
                                <span className="text-ellipsis">Order No</span>
                            </th>
                            <th className="sorting_disabled pointer-style" onClick={handleSortTicker}>
                                <span className="text-ellipsis">Ticker</span>
                                {!isTickerAsc && isSortTicker && <i className="bi bi-caret-down"></i>}
                                {isTickerAsc && isSortTicker && <i className="bi bi-caret-up"></i>}
                            </th>
                            <th className="sorting_disabled text-center pointer-style" onClick={handleSortSide}>
                                <span className="text-ellipsis">Side</span>
                                {!isSideAsc && isSortSide && <i className="bi bi-caret-down"></i>}
                                {isSideAsc && isSortSide && <i className="bi bi-caret-up"></i>}
                            </th>
                            <th className="sorting_disabled text-center">
                                <span className="text-ellipsis">Type</span>
                            </th>
                            <th className="text-end sorting_disabled pointer-style" onClick={handleSortPrice}>
                                <span className="text-ellipsis">Price</span>
                                {!isPriceAsc && isSortPrice && <i className="bi bi-caret-down"></i>}
                                {isPriceAsc && isSortPrice && <i className="bi bi-caret-up"></i>}
                            </th>
                            <th className="text-end sorting_disabled">
                                <span className="text-ellipsis">Quantity</span>
                            </th>
                            <th className="text-end sorting_disabled">
                                <span className="text-ellipsis">Pending</span>
                            </th>
                            <th className="text-end sorting_disabled pointer-style" onClick={handleSortDateTime}>
                                <span className="text-ellipsis">Datetime</span>
                                {!isDateTimeAsc && isSortDateTime && <i className="bi bi-caret-down"></i>}
                                {isDateTimeAsc && isSortDateTime && <i className="bi bi-caret-up"></i>}
                            </th>
                            <th className="text-end sorting_disabled">
                                {(dataSelectedList.length > 0) && 
                                    <button className="text-ellipsis btn btn-primary" 
                                        disabled={cancelListId.length > 0}
                                        onClick={() => btnCancelAllConfirm()}>Cancel</button>
                                }
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {getListModifyCancelData()}
                    </tbody>
                </table>
            </div>
        </div>
        <PaginationComponent totalItem={totalItem} itemPerPage={itemPerPage} 
                currentPage={currentPage}
            getItemPerPage={getItemPerPage} getCurrentPage={getCurrentPage} isShowAllRecord={false}
        />
        {isCancel && <ConfirmOrder isCancel={isCancel}
            handleCloseConfirmPopup={togglePopup}
            handleOrderResponse={getStatusOrderResponse}
            params={paramModifyCancel} 
            handleOrderCancelId={getOrderCancelId}
            handleOrderCancelIdResponse={getOrderCancelIdResponse}
        />}
        {isModify && <ConfirmOrder isModify={isModify}
            handleCloseConfirmPopup={togglePopup}
            handleOrderResponse={getStatusOrderResponse}
            params={paramModifyCancel} />}
        {isCancelAll && <PopUpConfirm handleCloseConfirmPopup={togglePopup}
            totalOrder={totalOrder} listOrder={dataSelected}
            handleOrderResponse={getStatusOrderResponse}
            handleOrderCancelId={getOrderCancelId}
            handleOrderCancelIdResponse={getOrderCancelIdResponse}
        />}
    </div>
}
export default memo(ListModifyCancel);
