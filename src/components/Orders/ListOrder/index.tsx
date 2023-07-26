import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ACCOUNT_ID, MESSAGE_TOAST, ORDER_TYPE, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED, SOCKET_RECONNECTED, SORT_MONITORING_SCREEN, TEAM_CODE } from "../../../constants/general.constant";
import { calcPendingVolume, checkMessageError, convertNumber, formatCurrency, formatOrderTime } from "../../../helper/utils";
import { IListOrderMonitoring, IParamOrderModifyCancel, IListOrderApiRes } from "../../../interfaces/order.interface";
import * as tspb from '../../../models/proto/trading_model_pb';
import './ListOrder.scss';
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import * as qmpb from "../../../models/proto/query_model_pb";
import { formatNumber, sortDateTime, sortPrice, sortSide, sortTicker, defindConfigPost } from "../../../helper/utils";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
import { ISymbolList } from "../../../interfaces/ticker.interface";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import PopUpConfirm from "../../Modal/PopUpConfirm";
import { TYPE_ORDER_RES } from "../../../constants/order.constant";
import { DEFAULT_DATA_MODIFY_CANCEL } from "../../../mocks";
import axios from "axios";
import { API_GET_PENDING_ORDER } from "../../../constants/api.constant";
import { GET_DATA_ALL_ACCOUNT, PAGE_SIZE_GET_ALL_ORDER_LIST, START_PAGE } from "../../../constants/general.constant";
import moment from "moment";

interface IPropsListOrder {
    getMsgSuccess: string;
    setMessageSuccess: (item: string) => void;
}

const accountId = sessionStorage.getItem(ACCOUNT_ID) || ''
const teamCode = sessionStorage.getItem(TEAM_CODE) || '';

const stateSortDefault = {
    feild: 'date',
    sortAsc: false,
    accountId: accountId
}

const stateSortList = JSON.parse(localStorage.getItem(SORT_MONITORING_SCREEN) || '[]')
const index = stateSortList.findIndex(item => item.accountId === accountId)
const stateSort = index >= 0 ? stateSortList[index] : stateSortDefault

const ListOrder = (props: IPropsListOrder) => {
    const { setMessageSuccess } = props;
    const tradingModelPb: any = tspb;
    const queryModelPb: any = qmpb;
    const [dataOrder, setDataOrder] = useState<Map<string, IListOrderMonitoring>>(new Map());
    const [triggerRender, setTriggerRender] = useState(false);
    const [isShowFullData, setShowFullData] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isModify, setIsModify] = useState(false);
    const [paramModifyCancel, setParamModifyCancel] = useState(DEFAULT_DATA_MODIFY_CANCEL);
    const [statusOrder, setStatusOrder] = useState(0);
    const [symbolListMap, setSymbolListMap] = useState<Map<string, ISymbolList>>(new Map());
    const [isCancelAll, setIsCancelAll] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [dataSelected, setDataSelected] = useState<IListOrderMonitoring[]>([]);
    const [listData, setListData] = useState<IListOrderMonitoring[]>([])
    const [selectedList, setSelectedList] = useState<Map<string, string>>(new Map());

    const [orderEventList, setOrderEventList] = useState<any[]>([]);
    const [statusModify, setStatusModify] = useState(0);

    const [position, setPosition] = useState({
        x: 0,
        y: 0
    })

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

    const [cancelListId, setCancelListId] = useState<Map<string, string>>(new Map());

    // dùng useRef để lấy element nên biến myRef sẽ khai báo any
    const myRef: any = useRef();

    const processSortData = (listData: Map<string, IListOrderMonitoring>) => {
        const convertToArray = Array.from(listData.values());
        if (isSortDateTime) {
            const listOrderSort: IListOrderMonitoring[] = sortDateTime(convertToArray, isDateTimeAsc)
            setListData(listOrderSort);
        }
        if (isSortPrice) {
            const listOrderSort: IListOrderMonitoring[] = sortPrice(convertToArray, isPriceAsc)
            setListData(listOrderSort);
        }
        if (isSortSide) {
            const listOrderSort: IListOrderMonitoring[] = sortSide(convertToArray, isSideAsc)
            setListData(listOrderSort);
        }
        if (isSortTicker) {
            const listOrderSort: IListOrderMonitoring[] = sortTicker(convertToArray, isTickerAsc)
            setListData(listOrderSort);
        }
        //Trigger render after sorted data
        setTriggerRender(!triggerRender);
    }

    useEffect(() => {
        const api_url = window.globalThis.apiUrl;
        const urlGetPendingOrder = `${api_url}${API_GET_PENDING_ORDER}`;
        const param = {
            account_id: GET_DATA_ALL_ACCOUNT,
            page: START_PAGE,
            page_size: PAGE_SIZE_GET_ALL_ORDER_LIST,
            order_side: 0,
            order_type: 0,
            symbol_code: ''
        }
        axios.post(urlGetPendingOrder, param, defindConfigPost()).then((resp) => {
            const resData: IListOrderApiRes[] = resp.data.results
            resData.forEach((item: IListOrderApiRes) => {
                const tmpData: IListOrderMonitoring = {
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
                    state: '1',
                    swap: '',
                    symbolCode: item.symbol_code,
                    time: item.exec_time,
                    tp: '',
                    triggerPrice: '',
                    uid: convertNumber(item.account_id),
                    filledAmount: item.exec_volume.toString(),
                }
                dataOrder.set(item.order_id, tmpData)
            })
            processSortData(dataOrder)
        })
    }, [])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendListOrder();
            }
        });


        const orderEvent = wsService.getOrderEvent().subscribe(resp => {
            console.log("resp.orderList ",resp.orderList, `${moment().format('YYYY-MM-DD HH:mm:ss')}.${moment().millisecond()}`);
            setOrderEventList(resp.orderList);
        })

        return () => {
            ws.unsubscribe();
            orderEvent.unsubscribe();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        processOrderEvent(orderEventList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const element = dataOrder.get(order.orderId);
        if (element) {
            dataOrder.set(order.orderId, {
                ...element,
                time: convertNumber(order?.executedDatetime),
                price: order?.price
            })
        } else {
            dataOrder.set(order.orderId, {
                ...order,
                time: convertNumber(order?.executedDatetime)
            })
        }
        processSortData(dataOrder);
    }

    const handleOrderCanceledAndFilled = (order) => {
        if (order?.state === tradingModelPb.OrderState.ORDER_STATE_CANCELED) {
            const element = cancelListId.get(order?.orderId);
            if (element) {
                cancelListId.delete(order?.orderId);
            }
        }
        removeOrder(order);
    }

    const handleOrderParital = (order) => {
        const element = dataOrder.get(order.orderId);
        let orderPrice = order?.price;
        if (order?.orderType === tradingModelPb.OrderType.OP_MARKET) {
            orderPrice = order?.entry === tradingModelPb.OrderEntry.ENTRY_IN ? order?.lastPrice : order.price;
        }
        if (element) {
            dataOrder.set(order.orderId, {
                ...element,
                amount: order?.amount,
                filledAmount: order?.totalFilledAmount,
                price: orderPrice
            });
        } else {
            dataOrder.set(order.orderId, {
                ...order,
                time: convertNumber(order?.executedDatetime),
            });
        }
        processSortData(dataOrder)
    }

    const handleOrderModified = (order) => {
        const element = dataOrder.get(order.orderId);
        if (element) {
            dataOrder.set(order.orderId, {
                ...element,
                time: convertNumber(order?.executedDatetime),
                amount: order?.filledAmount,
                filledAmount: '0'
            });
            setTriggerRender(!triggerRender)
        }
    }

    const handleOrderRejected = (order) => {
        removeOrder(order);
    }

    const removeOrder = (order) => {
        const element = dataOrder.get(order.orderId);
        if (element) {
            dataOrder.delete(order.orderId)
            setTriggerRender(!triggerRender)
        }
    }

    const sendListOrder = () => {
        let accountId = sessionStorage.getItem(ACCOUNT_ID) || '';
        prepareMessagee(accountId);
    }

    const prepareMessagee = (accountId: string) => {
        const uid = accountId;
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();

            orderRequest.setAccountId(uid);
            rpcMsg.setPayloadData(orderRequest.serializeBinary());
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            res.symbolList.forEach((item) => {
                if (item.symbolStatus !== queryModelPb.SymbolStatus.SYMBOL_DEACTIVE) {
                    symbolListMap.set(item.symbolCode, item);
                }
            })
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    useEffect(() => {
        window.scrollTo(position.x, position.y)
    }, [position])

    useEffect(() => {
        selectedList.forEach((value, key) => {
            if (!dataOrder.has(key)) {
                selectedList.delete(key);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerRender])

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const btnShowFullData = () => {
        setShowFullData(!isShowFullData);
        setPosition({
            x: myRef.current.getBoundingClientRect().left,
            y: myRef.current.getBoundingClientRect().top
        })
    }

    const getTicker = (symbolCode: string) => {
        const ticker = symbolListMap.get(symbolCode);
        return ticker;
    }

    const handleModify = (item: IListOrderMonitoring) => {
        const symbolName = symbolListMap.get(item.symbolCode)?.symbolName;
        const param: IParamOrderModifyCancel = {
            orderId: item.orderId.toString(),
            tickerCode: item.symbolCode.split('-')[0]?.trim(),
            tickerName: symbolName || '',
            orderType: item.orderType,
            volume: calcPendingVolume(item.amount, item.filledAmount).toString(),
            price: Number(item.price),
            side: item.side,
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
            uid: item.uid
        }
        setParamModifyCancel(param);
        setIsModify(true);
    }

    const handleCancel = (item: IListOrderMonitoring) => {
        const symbolName = symbolListMap.get(item.symbolCode)?.symbolName;
        const param: IParamOrderModifyCancel = {
            orderId: item.orderId.toString(),
            tickerCode: item.symbolCode.split('-')[0]?.trim(),
            tickerName: symbolName || '',
            orderType: item.orderType,
            volume: calcPendingVolume(item.amount, item.filledAmount).toString(),
            price: Number(item.price),
            side: item.side,
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
            uid: item.uid
        }
        setParamModifyCancel(param)
        setIsCancel(true)
    }

    const togglePopup = (isCloseModifyCancel: boolean) => {
        setIsModify(isCloseModifyCancel);
        setIsCancel(isCloseModifyCancel);
        setIsCancelAll(isCloseModifyCancel);
    }

    const _renderMessageSuccess = (typeOrderRes: string) => {
        setMessageSuccess(MESSAGE_TOAST.SUCCESS_PLACE);
        switch (typeOrderRes) {
            case (TYPE_ORDER_RES.Order):
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
            case TYPE_ORDER_RES.Cancel:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_CANCEL)}</div>
            case TYPE_ORDER_RES.Modify:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_MODIFY)}</div>
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
        if (statusOrder === 0 && typeOrderRes === TYPE_ORDER_RES.Order) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        if (typeOrderRes === TYPE_ORDER_RES.Cancel) {
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        if (statusModify === 0 && typeOrderRes === TYPE_ORDER_RES.Modify) {
            setStatusModify(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        return <></>;
    }

    const btnCancelAllConfirm = () => {
        const dataSelected = listData.filter(item => selectedList.has(item.orderId));
        setDataSelected(dataSelected);
        setIsCancelAll(true);
        setTotalOrder(dataSelected.length);
    }

    const handleChecked = (event: any, item: any) => {
        if (item) {
            const element = selectedList.get(item.orderId);
            if (event.target.checked) {
                if (!element) {
                    selectedList.set(item.orderId, item.orderId);
                }
            } else {
                if (element) {
                    selectedList.delete(item.orderId);
                }
            }
            setTriggerRender(!triggerRender)
        }
    }

    const handleCheckedAll = (event: any) => {
        if (event.target.checked) {
            listData.forEach((item) => {
                selectedList.set(item.orderId,item.orderId);
            });
        } else {
            selectedList.clear()
        }
        setTriggerRender(!triggerRender)
    }

    const handleSortTicker = () => {
        setIsSortTicker(true);
        setIsSortPrice(false);
        setIsSortSide(false);
        setIsSortDateTime(false);
        const stateSortTmp = {
            field: 'ticker',
            sortAsc: !isTickerAsc,
            accountId: accountId
        }

        if (index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MONITORING_SCREEN, JSON.stringify(stateSortList))
        const tmp = sortTicker(listData, !isTickerAsc)
        setListData(tmp);
        setIsTickerAsc(isTickerAsc ? false : true);
    }

    const handleSortDateTime = () => {
        setIsSortTicker(false);
        setIsSortPrice(false);
        setIsSortSide(false);
        setIsSortDateTime(true);
        const stateSortTmp = {
            field: 'date',
            sortAsc: !isDateTimeAsc,
            accountId: accountId
        }

        if (index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MONITORING_SCREEN, JSON.stringify(stateSortList))
        const tmp = sortDateTime(listData, !isDateTimeAsc)
        setListData(tmp);
        setIsDateTimeAsc(isDateTimeAsc ? false : true);
    }

    const handleSortSide = () => {
        setIsSortTicker(false);
        setIsSortPrice(false);
        setIsSortDateTime(false);
        setIsSortSide(true);
        const stateSortTmp = {
            field: 'side',
            sortAsc: !isSideAsc,
            accountId: accountId
        }
        if (index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MONITORING_SCREEN, JSON.stringify(stateSortList))
        const tmp = sortSide(listData, !isSideAsc)
        setListData(tmp);
        setIsSideAsc(isSideAsc ? false : true);
    }

    const handleSortPrice = () => {
        setIsSortTicker(false);
        setIsSortDateTime(false);
        setIsSortSide(false);
        setIsSortPrice(true);
        const stateSortTmp = {
            field: 'price',
            sortAsc: !isPriceAsc,
            accountId: accountId
        }
        if (index >= 0) {
            stateSortList[index] = stateSortTmp
        } else {
            stateSortList.push(stateSortTmp)
        }

        localStorage.setItem(SORT_MONITORING_SCREEN, JSON.stringify(stateSortList))
        const tmp = sortPrice(listData, !isPriceAsc)
        setListData(tmp);
        setIsPriceAsc(isPriceAsc ? false : true);
    }

    const getOrderCancelId = (orderId: string) => {
        const element = cancelListId.get(orderId);
        if (orderId !== '' && orderId !== null && orderId !== undefined && !element) {
            cancelListId.set(orderId, orderId);
        }
        setTriggerRender(!triggerRender);
    }

    const checkOrderExistListCancelId = (orderId: string) => {
        return cancelListId.has(orderId);
    }

    const getOrderCancelIdResponse = (orderId: string) => {
        const element = cancelListId.get(orderId);
        if (element) {
            cancelListId.delete(orderId);
        }
        selectedList.clear();
        setTriggerRender(!triggerRender);
    }

    useEffect(() => {
        setUpDataDisplay();
    }, [triggerRender])

    const setUpDataDisplay = () => {
        const tmp: IListOrderMonitoring[] = [];
        listData.forEach(ord => {
            const item = dataOrder.get(ord.orderId);
            if (item) tmp.push(item);
        })
        setListData(tmp);
    }

    const _renderHeaderTableListOrder = useMemo(() => {
        return (
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" value=""
                            name="allSelect"
                            onChange={handleCheckedAll}
                            checked={selectedList.size === dataOrder.size && dataOrder.size > 0}
                        />
                    </th>
                    {teamCode && teamCode !== 'null' && (
                        <th className="sorting_disabled">
                            <span className="text-ellipsis">Account ID</span>
                        </th>
                    )}
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
                        {(selectedList.size > 0) &&
                            <button className="text-ellipsis btn btn-primary"
                                disabled={cancelListId.size > 0}
                                onClick={() => btnCancelAllConfirm()}>Cancel</button>
                        }

                    </th>
                </tr>
            </thead>
        );
    }, [triggerRender, isSortDateTime, isSortPrice, isSortSide, isSortTicker, isSideAsc, isTickerAsc, isDateTimeAsc, isPriceAsc])

    const _renderBodyTableListOrder = () => {
        return <>
            <tbody>
                {listData.map((item, index) => {
                    const { symbolCode, uid, externalOrderId, side, orderType, price, amount, filledAmount, time, orderId } = item;
                    return (
                        <tr key={index} className="odd">
                            <CheckboxRenderer selectedList={selectedList} index={index} orderId={orderId} handleChecked={(event) => handleChecked(event, item)} />
                            <UidRenderer teamCode={teamCode} uid={uid} />
                            <ExternalOrderIdRenderer externalOrderId={externalOrderId} />
                            <CodeRender getTicker={getTicker} symbolCode={symbolCode} />
                            <SideRender side={side} tradingModelPb={tradingModelPb} getSideName={getSideName} />
                            <TypeRender orderType={orderType} />
                            <PriceRenderer price={price} />
                            <AmountRenderer amount={amount} filledAmount={filledAmount} />
                            <TimeRenderer time={time} />
                            <ActionRenderer orderId={orderId} handleModify={() => handleModify(item)} checkOrderExistListCancelId={checkOrderExistListCancelId} handleCancel={() => handleCancel(item)} />
                        </tr>
                    )
                })}
            </tbody>
        </>
    }

    return (
        <>
            <div className="card order-list">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0"><i className="bi bi-clipboard"></i> Order List</h6>
                    <div>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a id="show-data" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white" ref={myRef}>
                            <i className={`bi bi-chevron-compact-${isShowFullData ? 'down' : 'up'}`}></i>
                        </a>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className={`table-responsive ${!isShowFullData ? 'mh-350' : ''} tableFixHead`}>
                        <table className="table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}>
                            {_renderHeaderTableListOrder}
                            {_renderBodyTableListOrder()}
                        </table>
                    </div>
                </div>
            </div>

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
                params={paramModifyCancel}
            />}
            {isCancelAll && <PopUpConfirm handleCloseConfirmPopup={togglePopup}
                totalOrder={totalOrder} listOrder={dataSelected}
                handleOrderResponse={getStatusOrderResponse}
                handleOrderCancelId={getOrderCancelId}
                handleOrderCancelIdResponse={getOrderCancelIdResponse}
            />}
        </>
    )
}

const CheckboxRenderer: React.FC<any> = React.memo(({ selectedList, index, orderId, handleChecked }) => {
    return <>
        <td>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" value=""
                    checked={selectedList.has(orderId)}
                    name={index.toString()}
                    onChange={handleChecked}
                    id="all" />
            </div>
        </td>
    </>
})

const UidRenderer: React.FC<any> = React.memo(({ teamCode, uid }) => {
    return <>
        {teamCode && teamCode !== 'null' && (
            <td className="fm">{uid}</td>
        )}
    </>
})

const ExternalOrderIdRenderer: React.FC<any> = React.memo(({ externalOrderId }) => {
    return <>
        
        <td className="fm">{externalOrderId}</td>
    </>
})

const CodeRender: React.FC<any> = React.memo(({ getTicker, symbolCode }) => {
    return <>
        <td title={getTicker(symbolCode)?.symbolName}>{symbolCode}</td>
    </>
})
const SideRender: React.FC<any> = React.memo(({side, tradingModelPb, getSideName }) => {
    return <>
        <td className="text-center "><span className={`${side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(side)}</span></td>
    </>
})
const TypeRender: React.FC<any> = React.memo(({ orderType }) => {
    return <>
        <td className="text-center ">{ORDER_TYPE.get(orderType)}</td>
    </>
})

const PriceRenderer: React.FC<any> = React.memo(({ price }) => {
    return <>
        <td className="text-end ">{formatCurrency(price.toString())}</td>
    </>
})

const AmountRenderer: React.FC<any> = React.memo(({amount, filledAmount }) => {
    return <>
        <td className="text-end ">{formatNumber(amount.toString())}</td>
        <td className="text-end">{formatNumber(calcPendingVolume(amount, filledAmount).toString())}</td>
    </>
})

const TimeRenderer: React.FC<any> = React.memo(({ time }) => {
    return <>
        <td className="text-end">{formatOrderTime(time)}</td>
    </>
})

const ActionRenderer: React.FC<any> = React.memo(({ orderId, handleModify, checkOrderExistListCancelId, handleCancel }) => {
    return <td className="text-end">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="btn-edit-order mr-10" onClick={handleModify}>
            <i className="bi bi-pencil-fill"></i>
        </a>
        {!checkOrderExistListCancelId(orderId) ?
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a onClick={handleCancel}>
                <i className="bi bi-x-lg"></i>
            </a>
            : <div className="spinner-border spinner-border-sm" role="status">
                <span className="sr-only"></span>
            </div>
        }
    </td>
})

export default React.memo(ListOrder);