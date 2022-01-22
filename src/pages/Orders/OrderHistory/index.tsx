import OrderHistorySearch from '../../../components/Orders/OrderSearch'
import OrderTable from '../../../components/Orders/OrderTable'
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { OBJ_AUTHEN, SOCKET_CONNECTED } from '../../../constants/general.constant';
import { IParamHistorySearch } from '../../../interfaces/order.interface'

const OrderHistory = () => {
    const [listOrderHistory, setListOrderHistory] = useState([]);
    const [dataFromOrderHistorySearch, setDataFromOrderHistorySearch] = useState(
        {
            ticker: '',
            orderState: 0,
            orderType: 0,
            fromDatetime: '',
            toDatetime: ''
        }
    )

    const { ticker, orderState, orderType, fromDatetime, toDatetime } = dataFromOrderHistorySearch

    const getDataFromOrderHistorySearch = (dataParam: IParamHistorySearch) => {
        setDataFromOrderHistorySearch(dataParam)
    }

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();;
            }
        });

        const renderDataToScreen = wsService.getListOrderHistory().subscribe(res => {
            setListOrderHistory(res.orderList)
        });

        return () => {
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
        }
    }, [])

    const buildMessage = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();
            orderHistoryRequest.setAccountId(Number(accountId));

            orderHistoryRequest.setSymbolCode(ticker);
            orderHistoryRequest.setOrderType(orderType);
            orderHistoryRequest.setFromDatetime(Number(fromDatetime));
            orderHistoryRequest.setToDatetime(Number(toDatetime));
            orderHistoryRequest.setOrderState(orderState);

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
            rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendListOrder = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessage(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                buildMessage(accountId);
                return;
            }
        });
    }

    const _renderOrderHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <OrderHistorySearch getDataFromOrderHistorySearch={getDataFromOrderHistorySearch} />
                        <OrderTable listOrderHistory={listOrderHistory} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            {_renderOrderHistory()}
        </div>
    )
}
export default OrderHistory
