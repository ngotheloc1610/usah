import PaginationComponent from "../../../Common/Pagination";
import "./ListModifyCancel.css";
import * as tspb from "../../../models/proto/trading_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import * as pspb from "../../../models/proto/pricing_service_pb";
import { wsService } from "../../../services/websocket-service";
import { useEffect, useState } from "react";
import { IListOrderModifyCancel, IParamOrder, IParamOrderModifyCancel } from "../../../interfaces/order.interface";
import * as qspb from "../../../models/proto/query_service_pb"
import { ACCOUNT_ID, DEFAULT_ITEM_PER_PAGE, LIST_TICKER_ALL, MESSAGE_TOAST, ORDER_TYPE, ORDER_TYPE_NAME, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED, SOCKET_RECONNECTED, START_PAGE, TITLE_CONFIRM } from "../../../constants/general.constant";
import { renderCurrentList, calcPendingVolume, formatCurrency, formatNumber, formatOrderTime, checkMessageError } from "../../../helper/utils";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
import PopUpConfirm from "../../Modal/PopUpConfirm";
import { TYPE_ORDER_RES } from "../../../constants/order.constant";
import { DEFAULT_DATA_MODIFY_CANCEL } from "../../../mocks";

interface IPropsListModifyCancel {
    orderSide: number;
    symbolCode: string;
    isSearch: boolean;
    orderType: number;
    resetIsSearch: (value: boolean) => void;
}

const ListModifyCancel = (props: IPropsListModifyCancel) => {
    const { orderSide, symbolCode, isSearch, orderType, resetIsSearch } = props;
    const [listOrderFull, setListOrderFull] = useState<IListOrderModifyCancel[]>([]);
    const [listOrder, setListOrder] = useState<IListOrderModifyCancel[]>([]);
    const [dataOrder, setDataOrder] = useState<IListOrderModifyCancel[]>([]);
    const [statusOrder, setStatusOrder] = useState(0);
    const tradingModelPb: any = tspb;
    const [isModify, setIsModify] = useState<boolean>(false);
    const [isCancel, setIsCancel] = useState<boolean>(false);
    const [statusCancel, setStatusCancel] = useState(0);
    const [statusModify, setStatusModify] = useState(0);
    
    const [paramModifyCancel, setParamModifyCancel] = useState<IParamOrderModifyCancel>(DEFAULT_DATA_MODIFY_CANCEL);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [isCancelAll, setIsCancelAll] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [dataSelected, setDataSelected] = useState<IListOrderModifyCancel[]>([]);
    const [dataSelectedList, setSelectedList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const totalItem = listOrder.length;
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');

    const pricingServicePb: any = pspb;
    const rpc: any = rpcpb;

    useEffect(() => {
        const listOrderSortDate: IListOrderModifyCancel[] = listOrder.sort((a, b) => (b?.time.toString())?.localeCompare(a?.time.toString()));
        const currentList = renderCurrentList(currentPage, itemPerPage, listOrderSortDate);
        if (currentList.length <= 0 && isSearch) {
            currentPage === START_PAGE ? setCurrentPage(START_PAGE) : setCurrentPage(currentPage - 1);
            if (resetIsSearch) {
                resetIsSearch(false);
            }
        }
        setDataOrder(currentList);
    }, [listOrder, itemPerPage, currentPage])

    useEffect(() => {
        setCurrentPage(currentPage);
    }, [isCancel])

    useEffect(() => {
        setCurrentPage(START_PAGE);
    }, [orderSide])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendListOrder();
                subscribeQuoteEvent();
            }
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(resp => {
            if (resp && resp.quoteList) {
                sendListOrder();
            }
        })

        const listOrder = wsService.getListOrder().subscribe(response => {
            setListOrderFull(response.orderList);
        });

        return () => {
            ws.unsubscribe();
            listOrder.unsubscribe();
            quoteEvent.unsubscribe();
            unsubscribeQuoteEvent();
        }
    }, []);

    useEffect(() => {
        const orderIds = dataOrder.map((order) => order.externalOrderId);
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

    const subscribeQuoteEvent = () => {
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            symbolsList.forEach(item => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            })
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const unsubscribeQuoteEvent = () => {
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            symbolsList.forEach((item: any) => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
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
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
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

    const _rendetMessageSuccess = (message: string, typeOrderRes: string) => {
        // To handle when modify or cancel success then update new data without having to press f5
        MESSAGE_TOAST.SUCCESS_PLACE && sendListOrder();
        setMsgSuccess(MESSAGE_TOAST.SUCCESS_PLACE);
        switch(typeOrderRes) {
            case TYPE_ORDER_RES.Order:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
            case TYPE_ORDER_RES.Modify:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_MODIFY)}</div>
            case TYPE_ORDER_RES.Cancel:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_CANCEL)}</div>
        }
    }

    const _rendetMessageError = (message: string, msgCode: number) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.error(messageDis)}</div>
    }

    const getStatusOrderResponse = (value: number, content: string, typeOrderRes: string, msgCode: number) => {
        if (typeOrderRes === TYPE_ORDER_RES.Order && statusOrder === 0) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        if (typeOrderRes === TYPE_ORDER_RES.Cancel && statusCancel === 0) {
            setStatusCancel(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        if (typeOrderRes === TYPE_ORDER_RES.Modify && statusModify === 0) {
            setStatusModify(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeOrderRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        return <></>;
    }

    const getStatusModifyCancelOrCancelMulti = (value: boolean) => {
        if (value) {
            sendListOrder();
        }
    }

    const btnCancelAllConfirm = () => {
        const dataSelected = dataOrder.filter(item => dataSelectedList.includes(item.externalOrderId));
        setDataSelected(dataSelected);
        setIsCancelAll(true);
        setTotalOrder(dataSelected.length);
    }

    const handleChecked = (event: any, item: any) => {
        if (item) {
            const temps = [...dataSelectedList];
            const idx = temps.findIndex(o => o === item.externalOrderId);
            if (event.target.checked) {
                if (idx < 0) {
                    temps.push(item.externalOrderId);
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
                lst.push(item.externalOrderId);
            });
        }
        setSelectedList(lst);
    }

    const getListModifyCancelData = () => (
        dataOrder.map((item, index) => {
            return <tr key={index} className="odd">
                <td>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" value=""
                            checked={dataSelectedList.includes(item.externalOrderId)}
                            name={index.toString()}
                            onChange={(event) => handleChecked(event, item)}
                            id="all" />
                    </div>
                </td>
                <td className="fm">{item.externalOrderId}</td>
                <td title={getTickerName(item.symbolCode)}>{getTickerCode(item.symbolCode.toString())}</td>
                <td className="text-center "><span className={`${item.side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.side)}</span></td>
                <td className="text-center ">{ORDER_TYPE.get(item.orderType)}</td>
                <td className="text-end ">{formatCurrency(item.price.toString())}</td>
                <td className="text-end ">{formatNumber(item.amount.toString())}</td>
                <td className="text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</td>
                <td className="text-end">{formatOrderTime(item.time)}</td>
                <td className="text-end">
                    <a className="btn-edit-order mr-10" onClick={() => handleModifyCancel(item, TITLE_CONFIRM['modify'])}>
                        <i className="bi bi-pencil-fill"></i>
                    </a>
                    <a onClick={() => handleModifyCancel(item, TITLE_CONFIRM['cancel'])}>
                        <i className="bi bi-x-lg"></i>
                    </a>
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
                            <th className="sorting_disabled">
                                <span className="text-ellipsis">Order No</span>
                            </th>
                            <th className="sorting_disabled">
                                <span className="text-ellipsis">Ticker</span>
                            </th>
                            <th className="sorting_disabled text-center">
                                <span className="text-ellipsis">Side</span>
                            </th>
                            <th className="sorting_disabled text-center">
                                <span className="text-ellipsis">Type</span>
                            </th>
                            <th className="text-end sorting_disabled">
                                <span className="text-ellipsis">Price</span>
                            </th>
                            <th className="text-end sorting_disabled">
                                <span className="text-ellipsis">Quantity</span>
                            </th>
                            <th className="text-end sorting_disabled">
                                <span className="text-ellipsis">Pending</span>
                            </th>
                            <th className="text-end sorting_disabled">
                                <span className="text-ellipsis">Datetime</span>
                            </th>
                            <th className="text-end sorting_disabled">
                                {(dataSelectedList.length > 0) && <button className="text-ellipsis btn btn-primary" onClick={() => btnCancelAllConfirm()}>Cancel</button>}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {getListModifyCancelData()}
                    </tbody>
                </table>
            </div>
        </div>
        <PaginationComponent totalItem={totalItem} itemPerPage={itemPerPage} currentPage={currentPage}
            getItemPerPage={getItemPerPage} getCurrentPage={getCurrentPage}
        />
        {isCancel && <ConfirmOrder isCancel={isCancel}
            handleCloseConfirmPopup={togglePopup}
            handleOrderResponse={getStatusOrderResponse}
            params={paramModifyCancel}
            handleStatusModifyCancel={getStatusModifyCancelOrCancelMulti} />}
        {isModify && <ConfirmOrder isModify={isModify}
            handleCloseConfirmPopup={togglePopup}
            handleOrderResponse={getStatusOrderResponse}
            params={paramModifyCancel}
            handleStatusModifyCancel={getStatusModifyCancelOrCancelMulti} />}
        {isCancelAll && <PopUpConfirm handleCloseConfirmPopup={togglePopup}
            totalOrder={totalOrder} listOrder={dataSelected}
            handleOrderResponse={getStatusOrderResponse}
            handleStatusCancelAll={getStatusModifyCancelOrCancelMulti} />}
    </div>
}
export default ListModifyCancel;