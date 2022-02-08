import { useEffect, useState } from "react";
import { OBJ_AUTHEN, ORDER_TYPE_NAME, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { calcPendingVolume, formatCurrency, formatOrderTime } from "../../../helper/utils";
import { IListOrder, IParamOrder } from "../../../interfaces/order.interface";
import { LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
import * as tspb from '../../../models/proto/trading_model_pb';
import './ListOrder.css';
import { wsService } from "../../../services/websocket-service";
import queryString from 'query-string';
import ReduxPersist from "../../../config/ReduxPersist";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { formatNumber } from "../../../helper/utils";
import { IAuthen } from "../../../interfaces";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
interface IPropsListOrder {
    msgSuccess: string;
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

const 
ListOrder = (props: IPropsListOrder) => {
    const { msgSuccess } = props;
    const tradingModelPb: any = tspb;
    const [getDataOrder, setGetDataOrder] = useState<IListOrder[]>([]);
    const [isShowFullData, setShowFullData] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isModify, setIsModify] = useState(false);
    const [paramModifyCancel, setParamModifyCancel] = useState(paramModifiCancelDefault);
    const [statusOrder, setStatusOrder] = useState(0);

    useEffect(() => {
        callWs();
    }, []);

    useEffect(() => {
        const listOrder = wsService.getListOrder().subscribe(response => {
            setGetDataOrder(response.orderList);
        });
        return () => listOrder.unsubscribe();
    }, []);

    useEffect(() => {
        sendListOrder();
        const listOrder = wsService.getListOrder().subscribe(response => {
            setGetDataOrder(response.orderList);
        });
        return () => listOrder.unsubscribe();
    }, [msgSuccess]);

    const callWs = () => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();
            }
        });
    }

    const sendListOrder = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string | any = '';
        if (objAuthen.access_token) {
            accountId = objAuthen.account_id;
            ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen));
            prepareMessagee(accountId);
            return;
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then(resp => {
            if (resp) {
                const obj: IAuthen = JSON.parse(resp);
                accountId = obj.account_id;
                prepareMessagee(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID;
                prepareMessagee(accountId);
                return;
            }
        });
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

    const listOrderSortDate: IListOrder[] = getDataOrder.sort((a, b) => b.time - a.time);

    const getTickerName = (sympleId: string): string => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.ticker || '';
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const btnShowFullData = () => {
        setShowFullData(!isShowFullData);
    }

    const getTickerCode = (sympleId: string): string => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.ticker || '';
    }

    const handleModify = (item: IListOrder) => {
        console.log(131, item);
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
    }

    const _rendetMessageSuccess = () => (
        <div>{toast.success('Place order successfully')}</div>
    )

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
        }
    }

    const _renderTableListOrder = () => {
        return (
            <table className="dataTables_scrollBody table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}>
                <thead>
                    <tr>
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
                        <th className="text-end sorting_disabled">&nbsp;
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
        listOrderSortDate.map((item, index) => {
            return (
                <tr key={index} className="odd">
                    <td className="fm">{item.orderId}</td>
                    <td>{getTickerName(item.symbolCode.toString())}</td>
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
                    <div><a href="#" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white"><i className={`bi bi-chevron-compact-${isShowFullData ? 'up' : 'down'}`}></i></a></div>
                </div>
                <div className="card-body p-0">
                    <div className={`table-responsive ${!isShowFullData ? 'mh-250' : ''}`}>
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
        </>
    )
}

export default ListOrder;