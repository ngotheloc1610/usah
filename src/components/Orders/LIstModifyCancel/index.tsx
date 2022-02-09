import Pagination from "../../../Common/Pagination";
import "./ListModifyCancel.css";
import * as tspb from "../../../models/proto/trading_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import queryString from 'query-string';
import { wsService } from "../../../services/websocket-service";
import { useEffect, useState } from "react";
import ReduxPersist from "../../../config/ReduxPersist";
import { IListOrder, IParamOrder } from "../../../interfaces/order.interface";
import * as qspb from "../../../models/proto/query_service_pb"
import { OBJ_AUTHEN, ORDER_TYPE_NAME, RESPONSE_RESULT, SIDE, SOCKET_CONNECTED, SUCCESS_MESSAGE, TITLE_CONFIRM } from "../../../constants/general.constant";
import { calcPendingVolume, formatCurrency, formatNumber, formatOrderTime } from "../../../helper/utils";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import { toast } from "react-toastify";
import { IAuthen } from "../../../interfaces";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import { ISymbolList } from "../../../interfaces/ticker.interface";


const ListModifyCancel = () => {
    const [getDataOrder, setGetDataOrder] = useState<IListOrder[]>([]);
    const [statusOrder, setStatusOrder] = useState(0);
    const tradingModelPb: any = tspb;
    const [isModify, setIsModify] = useState<boolean>(false);
    const [isCancel, setIsCancel] = useState<boolean>(false);
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])

    const defaultData: IParamOrder = {
        tickerCode: '',
        tickerName: '',
        orderType: '',
        volume: '',
        price: 0,
        side: '',
        confirmationConfig: false,
        tickerId: ''
    }
    const [paramModifyCancel, setParamModifyCancel] = useState<IParamOrder>(defaultData);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const listOrderSortDate: IListOrder[] = getDataOrder.sort((a, b) => b.time - a.time);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();
                sendMsgSymbolList();
            }
        });
        
        const listOrder = wsService.getListOrder().subscribe(response => {
            setGetDataOrder(response.orderList);
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
        });

        return () => {
            ws.unsubscribe();
            listOrder.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, []);

    useEffect(() => {
        sendListOrder();
        const listOrder = wsService.getListOrder().subscribe(response => {
            setGetDataOrder(response.orderList);
        });
        return () => listOrder.unsubscribe();
    }, [msgSuccess]);

    const sendListOrder = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string | any = '';
        if (objAuthen.access_token) {
            accountId = objAuthen.account_id;
            ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen));
            prepareMessage(accountId);
            return;
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then(resp => {
            if (resp) {
                const obj: IAuthen = JSON.parse(resp);
                accountId = obj.account_id;
                prepareMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID;
                prepareMessage(accountId);
                return;
            }
        });
    }

    const prepareMessage = (accountId: string) => {
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

    const getTickerCode = (symbolId: string): string => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolCode || '';
    }

    const getTickerName = (symbolId: string): string => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolName || '';
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const handleModifyCancel = (item: IListOrder, value: string) => {
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
        if (value === TITLE_CONFIRM['modify']) {
            setIsModify(true);
            return;
        }
        setIsCancel(true);
    }

    const togglePopup = (isCloseModifyCancel: boolean) => {
        setIsModify(isCloseModifyCancel);
        setIsCancel(isCloseModifyCancel);
    }

    const _rendetMessageSuccess = (message: string) => {
        // To handle when modify or cancel success then update new data without having to press f5
        setMsgSuccess(SUCCESS_MESSAGE.placeSuccess)
        return <div>{toast.success(SUCCESS_MESSAGE.placeSuccess)}</div>
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const getStatusOrderResponse = (value: number, content: string) => {
        if (statusOrder === 0) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content)}
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

    const getListModifyCancelData = () => (
        listOrderSortDate.map((item, index) => {
            return <tr key={index}>
                <td className="fm">{item.orderId}</td>
                <td>{getTickerCode(item.symbolCode.toString())}</td>
                <td className="text-center w-10"><span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span></td>
                <td className="text-center">{ORDER_TYPE_NAME.limit}</td>
                <td className="text-end">{formatCurrency(item.price.toString())}</td>
                <td className="text-end">{formatNumber(item.amount.toString())}</td>
                <td className="text-end">{formatNumber(item.filledAmount.toString())}</td>
                <td className="text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</td>
                <td className="text-center">{formatOrderTime(item.time)}</td>
                <td className="text-end">
                    <a className="btn-edit-order mr-10px" onClick={() => handleModifyCancel(item, TITLE_CONFIRM['modify'])}>
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
            <div className="table table-responsive">
                <table className="table table-sm table-hover mb-0 dataTable no-footer">
                    <thead>
                        <tr>
                            <th><span>Order ID</span></th>
                            <th><span>Ticker</span></th>
                            <th className="text-center"><span>Side</span></th>
                            <th className="text-center"><span>Type</span></th>
                            <th className="text-end"><span>Price</span></th>
                            <th className="text-end"><span>Volume</span></th>
                            <th className="text-end"><span>Executed Volume</span></th>
                            <th className="text-end"><span>Pending</span></th>
                            <th className="text-center"><span>Datetime</span></th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getListModifyCancelData()}
                    </tbody>
                </table>
            </div>
        </div>
        <Pagination />
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
    </div>
}
export default ListModifyCancel;