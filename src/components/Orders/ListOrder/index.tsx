import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { GET_DATA_ALL_ACCOUNT, PAGE_SIZE_GET_ALL_ORDER_LIST, START_PAGE, DEFAULT_ROW_HEIGHT } from "../../../constants/general.constant";
import moment from "moment";
import { Table, AutoSizer, CellMeasurerCache, CellMeasurer, Column } from 'react-virtualized';

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

    const [scrollToIndex, setScrollToIndex] = useState<number>(0);

    const cache = useRef(new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: DEFAULT_ROW_HEIGHT
    }))

    const tableBodyRef:any = useRef();

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

    const handleChecked = (event: any, item: any, rowIndex: number) => {
        setScrollToIndex(rowIndex)
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
                selectedList.set(item.orderId, item.orderId);
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

    const _renderTableListOrder = () => {
        return <>
            <AutoSizer onResize={() => {
                cache.current.clearAll()
            }}>{({ width, height }) => {
                let responseWidth = width
                // Fix responsive when resize, we set default width to able to see full column
                if (width < 995) {
                    responseWidth = 1000
                }
                return <Table
                    width={responseWidth}
                    height={height}
                    headerHeight={cache.current.defaultHeight}
                    rowHeight={35}
                    rowCount={listData.length}
                    deferredMeasurementCache={cache.current}
                    rowGetter={({ index }) => listData[index]}
                    rowClassName="list-order-row"
                    scrollToIndex={scrollToIndex}
                    scrollToAlignment="center"
                >
                    <Column
                        dataKey=""
                        minWidth={5}
                        width={5}
                        flexGrow={0.2}
                        headerRenderer={() =>
                            <input type="checkbox" value=""
                                name="allSelect"
                                onChange={handleCheckedAll}
                                checked={selectedList.size === dataOrder.size && dataOrder.size > 0} />
                        }
                        cellRenderer={({ rowData, rowIndex }) =>
                            <input className="" type="checkbox" value=""
                                checked={selectedList.has(rowData['orderId'])}
                                name={index.toString()}
                                onChange={(e) => handleChecked(e, rowData, rowIndex)}
                                id="all" />
                        } />
                    {teamCode && teamCode !== 'null' && (<Column label="Account ID" dataKey="uid" minWidth={50} width={50}
                        flexGrow={0.8}
                        headerRenderer={({ label }) =>
                            <span className="text-ellipsis text-capitalize">{label}</span>

                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span>{cellData}</span>
                            </CellMeasurer>
                        } />)}
                    <Column minWidth={50} width={50} label="Order No" dataKey="externalOrderId"
                        flexGrow={1}
                        headerRenderer={({ label }) =>
                            <span className="text-ellipsis text-capitalize">{label}</span>
                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span>{cellData}</span>
                            </CellMeasurer>
                        } />
                    <Column minWidth={15} width={15} label="Ticker" dataKey="symbolCode"
                        flexGrow={0.8}
                        headerRenderer={({ label }) =>
                            <div className="sorting_disabled pointer-style" onClick={handleSortTicker}>
                                <span className="text-ellipsis text-capitalize">{label}</span>
                                {!isTickerAsc && isSortTicker && <i className="bi bi-caret-down"></i>}
                                {isTickerAsc && isSortTicker && <i className="bi bi-caret-up"></i>}
                            </div>
                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span>{cellData}</span>
                            </CellMeasurer>
                        } />
                    <Column minWidth={10} width={10} label="Side" dataKey="side"
                        flexGrow={0.5}
                        headerRenderer={({ label }) =>
                            <div className="sorting_disabled pointer-style text-center" onClick={handleSortSide}>
                                <span className="text-ellipsis text-capitalize">{label}</span>
                                {!isSideAsc && isSortSide && <i className="bi bi-caret-down"></i>}
                                {isSideAsc && isSortSide && <i className="bi bi-caret-up"></i>}
                            </div>
                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span className={`d-block text-center ${cellData === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(cellData)}</span>
                            </CellMeasurer>
                        } />
                    <Column minWidth={10} width={10} label="Type" dataKey="orderType"
                        flexGrow={0.5}
                        headerRenderer={({ label }) =>
                            <span className="d-block text-center text-ellipsis text-capitalize">{label}</span>
                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span className="d-block text-center ">{ORDER_TYPE.get(cellData)}</span>
                            </CellMeasurer>
                        } />
                    <Column minWidth={20} width={20} label="Price" dataKey="price"
                        flexGrow={0.8}
                        headerRenderer={({ label }) =>
                            <div className="sorting_disabled pointer-style text-end" onClick={handleSortPrice}>
                                <span className="text-ellipsis text-capitalize">{label}</span>
                                {!isPriceAsc && isSortPrice && <i className="bi bi-caret-down"></i>}
                                {isPriceAsc && isSortPrice && <i className="bi bi-caret-up"></i>}
                            </div>
                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span className="d-block text-end">{formatCurrency(cellData.toString())}</span>
                            </CellMeasurer>
                        } />
                    <Column minWidth={20} width={20} label="Quantity" dataKey="amount"
                        flexGrow={0.8}
                        headerRenderer={({ label }) =>
                            <span className="d-block text-end text-ellipsis text-capitalize">{label}</span>
                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span className="d-block text-end">{formatNumber(cellData.toString())}</span>
                            </CellMeasurer>
                        } />
                    <Column minWidth={20} width={20} label="Pending" dataKey="filledAmount"
                        flexGrow={0.8}
                        headerRenderer={({ label }) =>
                            <span className="d-block text-end text-ellipsis text-capitalize">{label}</span>
                        }
                        cellRenderer={({ cellData, rowData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span className="d-block text-end">{formatNumber(calcPendingVolume(rowData['amount'], cellData).toString())}</span>
                            </CellMeasurer>
                        } />
                    <Column minWidth={80} width={120} label="Datetime" dataKey="time"
                        flexGrow={1}
                        headerRenderer={({ label }) =>
                            <div className="sorting_disabled pointer-style text-end" onClick={handleSortDateTime}>
                                <span className="text-ellipsis text-capitalize">{label}</span>
                                {!isDateTimeAsc && isSortDateTime && <i className="bi bi-caret-down"></i>}
                                {isDateTimeAsc && isSortDateTime && <i className="bi bi-caret-up"></i>}
                            </div>
                        }
                        cellRenderer={({ cellData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span className="d-block text-end">{formatOrderTime(cellData)}</span>
                            </CellMeasurer>
                        } />
                    <Column
                        dataKey=""
                        minWidth={12}
                        width={12}
                        flexGrow={0.6}
                        headerRenderer={() => {
                            return (selectedList.size > 0) &&
                                <div className="d-flex justify-content-end">
                                    <button className="btn-primary cancel-btn"
                                        disabled={cancelListId.size > 0}
                                        onClick={() => btnCancelAllConfirm()}>Cancel</button>
                                </div>
                        }
                        }
                        cellRenderer={({ rowData, dataKey, parent, rowIndex }) =>
                            <CellMeasurer
                                cache={cache.current}
                                columnIndex={0}
                                key={dataKey}
                                parent={parent}
                                rowIndex={rowIndex}>
                                <span className="d-block text-end"> {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                    <a className="btn-edit-order mr-10" onClick={e => handleModify(rowData)}>
                                        <i className="bi bi-pencil-fill"></i>
                                    </a>
                                    {!checkOrderExistListCancelId(rowData["orderId"]) ?
                                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                        <a onClick={e => handleCancel(rowData)}>
                                            <i className="bi bi-x-lg"></i>
                                        </a>
                                        : <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="sr-only"></span>
                                        </div>
                                    }</span>
                            </CellMeasurer>
                        } />
                </Table>
            }}</AutoSizer>
        </>
    }

    const getRowHeight = () => {
        if (listData.length === 0) {
            return DEFAULT_ROW_HEIGHT
        }
        if (isShowFullData || (!isShowFullData && listData.length < 10)) {
            return (listData.length + 1) * DEFAULT_ROW_HEIGHT;
        } else {
            return 350
        }
    };

    // This function check to show scrollbar X if screen is small
    const isMobileScreen = () => {
        const tableBody = tableBodyRef.current
        if (tableBody) {
            return tableBody.offsetWidth < 995
        }
        return false
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
                {/* Bug #84529
                    The key props will force React to re-build the DOM tree every time the view is changed 
                */}
                <div key={Math.random().toString(36).slice(2)} ref={tableBodyRef} className="card-body p-0" style={{overflow: 'hidden', overflowX: `${getRowHeight() === DEFAULT_ROW_HEIGHT || !isMobileScreen() ? 'hidden' : 'scroll'}`}}>
                    <div className={`${!isShowFullData ? 'mh-350' : ''} `} style={{ minHeight: getRowHeight() }}>
                        {_renderTableListOrder()}
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

export default React.memo(ListOrder);