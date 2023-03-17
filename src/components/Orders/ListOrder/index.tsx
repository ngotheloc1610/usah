import { useEffect, useRef, useState, useMemo } from "react";
import { ACCOUNT_ID, LIST_WATCHING_TICKERS, MESSAGE_TOAST, ORDER_TYPE, ORDER_TYPE_NAME, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED, SOCKET_RECONNECTED } from "../../../constants/general.constant";
import { calcPendingVolume, checkMessageError, convertNumber, formatCurrency, formatOrderTime } from "../../../helper/utils";
import { IListOrderMonitoring, IParamOrderModifyCancel } from "../../../interfaces/order.interface";
import * as tspb from '../../../models/proto/trading_model_pb';
import './ListOrder.scss';
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import * as psbp from "../../../models/proto/pricing_service_pb";
import { formatNumber } from "../../../helper/utils";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
import { ISymbolList } from "../../../interfaces/ticker.interface";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import PopUpConfirm from "../../Modal/PopUpConfirm";
import { TYPE_ORDER_RES } from "../../../constants/order.constant";
import { DEFAULT_DATA_MODIFY_CANCEL } from "../../../mocks";
interface IPropsListOrder {
    getMsgSuccess: string;
    setMessageSuccess: (item: string) => void;
}



const ListOrder = (props: IPropsListOrder) => {
    const { getMsgSuccess, setMessageSuccess } = props;
    const tradingModelPb: any = tspb;
    const [dataOrder, setDataOrder] = useState<IListOrderMonitoring[]>([]);
    const [isShowFullData, setShowFullData] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isModify, setIsModify] = useState(false);
    const [paramModifyCancel, setParamModifyCancel] = useState(DEFAULT_DATA_MODIFY_CANCEL);
    const [statusOrder, setStatusOrder] = useState(0);
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [isCancelAll, setIsCancelAll] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [dataSelected, setDataSelected] = useState<IListOrderMonitoring[]>([]);

    const [selectedList, setSelectedList] = useState<any[]>([]);

    const [orderEventList, setOrderEventList] = useState<any[]>([]);

    const [statusCancel, setStatusCancel] = useState(0);
    const [statusModify, setStatusModify] = useState(0);

    const [position, setPosition] = useState({
        x: 0,
        y: 0
    })

    // sort ticker
    const [isTickerAsc, setIsTickerAsc] = useState(false);
    const [isSortTicker, setIsSortTicker] = useState(false);

    // sort price
    const [isPriceAsc, setIsPriceAsc] = useState(false);
    const [isSortPrice, setIsSortPrice] = useState(false);

    // sort orderSide
    const [isSideAsc, setIsSideAsc] = useState(false);
    const [isSortSide, setIsSortSide] = useState(false);

    // sort dateTime
    const [isSortDateTime, setIsSortDateTime] = useState(true);
    const [isDateTimeAsc, setIsDateTimeAsc] = useState(false);


    // dùng useRef để lấy element nên biến myRef sẽ khai báo any
    const myRef: any = useRef();

    const accId = localStorage.getItem(ACCOUNT_ID);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendListOrder();
            }
        });

        const listOrder = wsService.getListOrder().subscribe(response => {
            const listOrderSortDate: IListOrderMonitoring[] = response.orderList.sort((a, b) => b.time - a.time);
            setDataOrder(listOrderSortDate);
            processListOrder(response.orderList);
        });

        const orderEvent = wsService.getOrderEvent().subscribe(resp => {
            console.log("OrderEvent: ", resp.orderList);
            setOrderEventList(resp.orderList);
        })

        return () => {
            ws.unsubscribe();
            listOrder.unsubscribe();
            orderEvent.unsubscribe();
        }
    }, []);

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
        const tmpList = [...dataOrder];
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
        setDataOrder(tmpList);
    }

    const handleOrderCanceledAndFilled = (order) => {
        removeOrder(order);
    }

    const handleOrderParital = (order) => {
        const tmpList = [...dataOrder];
        const idx = tmpList.findIndex(o => o?.orderId === order.orderId);
        if (idx >= 0) {
            tmpList[idx] = {
                ...tmpList[idx],
                time: convertNumber(order?.executedDatetime),
                amount: order?.amount,
                filledAmount: order?.totalFilledAmount,
                price: order?.entry === tradingModelPb.OrderEntry.ENTRY_IN ? order?.lastPrice : order.price
            }
        } else {
            tmpList.unshift({
                ...order,
                time: convertNumber(order?.executedDatetime),
            });
        }
        setDataOrder(tmpList);
    }

    const handleOrderModified = (order) => {
        const tmpList = [...dataOrder];
        const idx = tmpList.findIndex(o => o?.orderId === order.orderId);
        if (idx >= 0) {
            tmpList[idx] = {
                ...tmpList[idx],
                time: convertNumber(order?.executedDatetime),
                amount: order?.filledAmount,
                filledAmount: '0'
            }
            setDataOrder(tmpList);
        }
    }

    const handleOrderRejected = (order) => {
        removeOrder(order);
    }

    const removeOrder = (order) => {
        const tmpList = [...dataOrder];
        const idx = tmpList.findIndex(o => o?.orderId === order.orderId);
        if (idx >= 0) {
            tmpList.splice(idx, 1);
            setDataOrder(tmpList);
        }
    }

    const sendListOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        prepareMessagee(accountId);
    }

    const processListOrder = (orderList: IListOrderMonitoring[]) => {
        const temp: any[] = [];
        const warchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
        const ownWatchList = warchList.filter(o => o.accountId === accId);
        orderList.forEach((item: IListOrderMonitoring) => {
            const idx = temp.findIndex(o => o?.symbolCode === item?.symbolCode);
            const idxWatchList = ownWatchList.findIndex(o => o?.symbolCode === item?.symbolCode);
            if (idx < 0 && idxWatchList < 0) {
                temp.push({
                    symbolCode: item.symbolCode
                });
            }
        });
        if (temp.length > 0) {
            subscribeQuoteEvent(temp);
        }
    }

    const subscribeQuoteEvent = (symbolList: any[]) => {
        const pricingServicePb: any = psbp;
        const rpc: any = rspb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            symbolList.forEach(item => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            })
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
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
            setSymbolList(res.symbolList)
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
        const orderIds = dataOrder.map((order) => order.orderId);
        const newSelectList = [...selectedList] 

        selectedList.forEach((item) => {
            if(!orderIds.includes(item)) {
                newSelectList.splice(newSelectList.indexOf(item), 1);
            }
        });

        setSelectedList(newSelectList);
    }, [dataOrder])

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
        const ticker = symbolList.find(item => item.symbolCode === symbolCode);
        return ticker;
    }

    const handleModify = (item: IListOrderMonitoring) => {
        const symbolName = symbolList.find(i => i.symbolCode === item.symbolCode)?.symbolName;
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
        }
        setParamModifyCancel(param);
        setIsModify(true);
    }

    const handleCancel = (item: IListOrderMonitoring) => {
        const symbolName = symbolList.find(i => i.symbolCode === item.symbolCode)?.symbolName;
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
        if (statusCancel === 0 && typeOrderRes === TYPE_ORDER_RES.Cancel) {
            setStatusCancel(value);
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
        const dataSelected = dataOrder.filter(item => selectedList.includes(item.orderId));
        setDataSelected(dataSelected);
        setIsCancelAll(true);
        setTotalOrder(dataSelected.length);
    }

    const handleChecked = (event: any, item: any) => {
        if (item) {
            const temps = [...selectedList];
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

    const handleSortTicker = () => {
        setIsSortTicker(true);
        setIsSortPrice(false);
        setIsSortSide(false);
        setIsSortDateTime(false);
        const temp = [...dataOrder];
        if (isTickerAsc) {
            // sort DESC
            temp.sort((a, b) => b?.symbolCode.localeCompare(a?.symbolCode))
            setIsTickerAsc(false);
            setDataOrder(temp);
            return;
        }
        // sort ASC
        temp.sort((a, b) => a?.symbolCode.localeCompare(b?.symbolCode))
        setIsTickerAsc(true);
        setDataOrder(temp);
    }

    const handleSortDateTime = () => {
        setIsSortTicker(false);
        setIsSortPrice(false);
        setIsSortSide(false);
        setIsSortDateTime(true);
        const temp = [...dataOrder];
        if (isDateTimeAsc) {
            // sort DESC
            temp.sort((a, b) => b?.time?.toString().localeCompare(a?.time?.toString()))
            setIsDateTimeAsc(false);
            setDataOrder(temp);
            return;
        }
        // sort ASC
        temp.sort((a, b) => a?.time?.toString().localeCompare(b?.time?.toString()))
        setIsDateTimeAsc(true);
        setDataOrder(temp);
    }

    const handleSortSide = () => {
        setIsSortTicker(false);
        setIsSortPrice(false);
        setIsSortDateTime(false);
        setIsSortSide(true);
        const temp = [...dataOrder];
        if (isSideAsc) {
            temp.sort((a, b) => b?.side - a?.side);
            setIsSideAsc(false);
            setDataOrder(temp);
            return;
        }
        temp.sort((a, b) => a?.side - b?.side);
        setIsSideAsc(true);
        setDataOrder(temp);
    }

    const handleSortPrice = () => {
        setIsSortTicker(false);
        setIsSortDateTime(false);
        setIsSortSide(false);
        setIsSortPrice(true);
        const temp = [...dataOrder];
        if (isPriceAsc) {
            temp.sort((a, b) => convertNumber(b?.price) - convertNumber(a?.price));
            setIsPriceAsc(false);
            setDataOrder(temp);
            return;
        }
        temp.sort((a, b) => convertNumber(a?.price) - convertNumber(b?.price));
        setIsPriceAsc(true);
        setDataOrder(temp);
        return;
    }

    const _renderTableListOrder = () => {
        return (
            <table className="dataTables_scrollBody table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}>
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" value=""
                                name="allSelect"
                                onChange={handleCheckedAll}
                                checked={selectedList.length === dataOrder.length && dataOrder.length > 0}
                            />
                        </th>
                        <th className="sorting_disabled">
                            <span className="text-ellipsis">Order No</span>
                        </th>
                        <th className="sorting_disabled pointer-style" onClick={handleSortTicker}>
                            <span className="text-ellipsis">Ticker</span>
                            {!isTickerAsc && isSortTicker && <i className="bi bi-caret-down"></i>}
                            {isTickerAsc && isSortTicker && <i className="bi bi-caret-up"></i>}
                        </th>
                        <th className="sorting_disabled text-center" onClick={handleSortSide}>
                            <span className="text-ellipsis">Side</span>
                            {!isSideAsc && isSortSide && <i className="bi bi-caret-down"></i>}
                            {isSideAsc && isSortSide && <i className="bi bi-caret-up"></i>}
                        </th>
                        <th className="sorting_disabled text-center">
                            <span className="text-ellipsis">Type</span>
                        </th>
                        <th className="text-end sorting_disabled" onClick={handleSortPrice}>
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
                            {(selectedList.length > 0) && <button className="text-ellipsis btn btn-primary" onClick={() => btnCancelAllConfirm()}>Cancel</button>}

                        </th>
                    </tr>
                </thead>
                <tbody>
                    {getListDataOrder()}
                </tbody>
            </table>
        );
    }
    const getListDataOrder = () => (
        dataOrder.map((item, index) => {
            return (
                <tr key={index} className="odd">
                    <td>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value=""
                                checked={selectedList.includes(item.orderId)}
                                name={index.toString()}
                                onChange={(event) => handleChecked(event, item)}
                                id="all" />
                        </div>
                    </td>
                    <td className="fm">{item.externalOrderId}</td>
                    <td title={getTicker(item.symbolCode)?.symbolName}>{getTicker(item.symbolCode)?.symbolCode}</td>
                    <td className="text-center "><span className={`${item.side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.side)}</span></td>
                    <td className="text-center ">{ORDER_TYPE.get(item.orderType)}</td>
                    <td className="text-end ">{formatCurrency(item.price.toString())}</td>
                    <td className="text-end ">{formatNumber(item.amount.toString())}</td>
                    <td className="text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</td>
                    <td className="text-end">{formatOrderTime(item.time)}</td>
                    <td className="text-end">
                        <a className="btn-edit-order mr-10" onClick={() => handleModify(item)}>
                            <i className="bi bi-pencil-fill"></i>
                        </a>
                        <a onClick={() => handleCancel(item)}>
                            <i className="bi bi-x-lg"></i>
                        </a>
                    </td>
                </tr>
            )
        })
    )
    return (
        <>
            <div className="card order-list">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0"><i className="bi bi-clipboard"></i> Order List</h6>
                    <div>
                        <a id="show-data" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white" ref={myRef}>
                            <i className={`bi bi-chevron-compact-${isShowFullData ? 'down' : 'up'}`}></i>
                        </a>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className={`table-responsive ${!isShowFullData ? 'mh-350' : ''} tableFixHead`}>
                        {_renderTableListOrder()}
                    </div>
                </div>
            </div>

            {isCancel && <ConfirmOrder isCancel={isCancel}
                handleCloseConfirmPopup={togglePopup}
                handleOrderResponse={getStatusOrderResponse}
                params={paramModifyCancel}
                />}
            {isModify && <ConfirmOrder isModify={isModify}
                handleCloseConfirmPopup={togglePopup}
                handleOrderResponse={getStatusOrderResponse}
                params={paramModifyCancel}
                />}
            {isCancelAll && <PopUpConfirm handleCloseConfirmPopup={togglePopup}
                totalOrder={totalOrder} listOrder={dataSelected}
                handleOrderResponse={getStatusOrderResponse} />}
        </>
    )
}

export default ListOrder;