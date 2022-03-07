import { useEffect, useState } from "react";
import { ACCOUNT_ID, MESSAGE_TOAST, OBJ_AUTHEN, ORDER_TYPE_NAME, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { calcPendingVolume, formatCurrency, formatOrderTime } from "../../../helper/utils";
import { IListOrder, IParamOrder } from "../../../interfaces/order.interface";
import * as tspb from '../../../models/proto/trading_model_pb';
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import './ListOrder.scss';
import { wsService } from "../../../services/websocket-service";
import queryString from 'query-string';
import ReduxPersist from "../../../config/ReduxPersist";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { formatNumber } from "../../../helper/utils";
import { IAuthen } from "../../../interfaces";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
import { ISymbolList } from "../../../interfaces/ticker.interface";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import PopUpConfirm from "../../Modal/PopUpConfirm";
interface IPropsListOrder {
    getMsgSuccess: string;
    getShowData: (item: boolean) => void;
    setMessageSuccess: (item: string) => void;
}


const paramModifiCancelDefault: IParamOrder = {
    tickerCode: '',
    tickerName: '',
    orderType: '',
    volume: '',
    price: 0,
    side: '',
    confirmationConfig: false,
    tickerId: ''
}

const ListOrder = (props: IPropsListOrder) => {
    const { getMsgSuccess, getShowData, setMessageSuccess } = props;
    const tradingModelPb: any = tspb;
    const [dataOrder, setDataOrder] = useState<IListOrder[]>([]);
    const [isShowFullData, setShowFullData] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isModify, setIsModify] = useState(false);
    const [paramModifyCancel, setParamModifyCancel] = useState(paramModifiCancelDefault);
    const [statusOrder, setStatusOrder] = useState(0);
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [isCancelAll, setIsCancelAll] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [dataSelected, setDataSelected] = useState<IListOrder[]>([]);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();
            }
        });

        return () => ws.unsubscribe()
    }, []);

    useEffect(() => {
        const listOrder = wsService.getListOrder().subscribe(response => {
            const listOrderSortDate: IListOrder[] = response.orderList.sort((a, b) => b.time - a.time);
            setDataOrder(listOrderSortDate);
        });
        return () => listOrder.unsubscribe();
    }, []);

    useEffect(() => {
        sendListOrder();
        const listOrder = wsService.getListOrder().subscribe(response => {
            const listOrderSortDate: IListOrder[] = response.orderList.sort((a, b) => b.time - a.time);
            setDataOrder(listOrderSortDate);
        });
        return () => listOrder.unsubscribe();
    }, [getMsgSuccess]);

    const sendListOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
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
            setSymbolList(res.symbolList)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQoutes = new pricingServicePb.GetLastQuotesRequest();
            symbolList.forEach(item => {
                lastQoutes.addSymbolCode(item.symbolId.toString())
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQoutes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getTickerName = (symbolId: string): string => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolName || '';
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const btnShowFullData = () => {
        setShowFullData(!isShowFullData);
        getShowData(isShowFullData)
    }

    const getTickerCode = (symbolId: string): string => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolCode || '';
    }

    const handleModify = (item: IListOrder) => {
        const param: IParamOrder = {
            orderId: item.orderId.toString(),
            tickerCode: getTickerCode(item.symbolCode.toString())?.toString(),
            tickerName: getTickerName(item.symbolCode.toString())?.toString(),
            orderType: ORDER_TYPE_NAME.limit,
            volume: calcPendingVolume(item.amount, item.filledAmount).toString(),
            price: Number(item.price),
            side: item.orderType.toString(),
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
        }
        setParamModifyCancel(param);
        setIsModify(true);
    }

    const handleCancel = (item: IListOrder) => {
        const param: IParamOrder = {
            orderId: item.orderId.toString(),
            tickerCode: getTickerCode(item.symbolCode.toString())?.toString(),
            tickerName: getTickerName(item.symbolCode.toString())?.toString(),
            orderType: ORDER_TYPE_NAME.limit,
            volume: item.amount,
            price: Number(item.price),
            side: item.orderType.toString(),
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

    const _rendetMessageSuccess = () => {
        setMessageSuccess(MESSAGE_TOAST.SUCCESS_PLACE);
        return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const getStatusOrderResponse = (value: number, content: string) => {
        if (statusOrder === 0) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess()}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
            </>
        }
        return <></>;
    }

    const getStatusModifyCancel = (value: boolean) => {
        if (value) {
            sendListOrder();
            getOrderBooks();
        }
    }

    const btnCancelAllConfirm = () => {
        const dataSelected = dataOrder.filter(item => item.isChecked);
        setDataSelected(dataSelected);
        setIsCancelAll(true);
        setTotalOrder(dataSelected.length);
    }
    const handleChecked = (e) => {
        const { name, checked } = e.target;
        if (name === "allSelect") {
            const isSelectAll = dataOrder.map((order) => {
                return { ...order, isChecked: checked };
            });
            setDataOrder(isSelectAll);
        } else {
            let tempOrder = dataOrder.map((order, index) =>
                Number(index) === Number(name) ? { ...order, isChecked: checked } : order
            );
            setDataOrder(tempOrder);
        }
    }
    const _renderTableListOrder = () => {
        return (
            <table className="dataTables_scrollBody table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}>
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" value=""
                                name="allSelect"
                                onChange={handleChecked}
                                checked={!dataOrder.some((order) => order?.isChecked !== true) && dataOrder.length > 0}
                            />
                        </th>
                        <th className="sorting_disabled">
                            <span className="text-ellipsis">Order ID</span>
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
                            <span className="text-ellipsis">Volume</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Pending</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Datetime</span>
                        </th>
                        <th className="text-end sorting_disabled">

                            {(dataOrder.some((order) => order?.isChecked === true) && dataOrder.length > 0) && <button className="text-ellipsis btn btn-primary" onClick={() => btnCancelAllConfirm()}>Cancel</button>}

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
                                checked={item?.isChecked || false}
                                name={index.toString()}
                                onChange={handleChecked}
                                id="all" />
                        </div>
                    </td>
                    <td className="fm">{item.orderId}</td>
                    <td>{getTickerCode(item.symbolCode.toString())}</td>
                    <td className="text-center "><span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span></td>
                    <td className="text-center ">{ORDER_TYPE_NAME.limit}</td>
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
                    <div><a href="#" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white"><i className={`bi bi-chevron-compact-${isShowFullData ? 'down' : 'up'}`}></i></a></div>
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
                handleStatusModifyCancel={getStatusModifyCancel} />}
            {isModify && <ConfirmOrder isModify={isModify}
                handleCloseConfirmPopup={togglePopup}
                handleOrderResponse={getStatusOrderResponse}
                params={paramModifyCancel}
                handleStatusModifyCancel={getStatusModifyCancel} />}
            {isCancelAll && <PopUpConfirm handleCloseConfirmPopup={togglePopup}
                totalOrder={totalOrder} listOrder={dataSelected}
                handleOrderResponse={getStatusOrderResponse} />}
        </>
    )
}

export default ListOrder;