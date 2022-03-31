import OrderHistorySearch from '../../../components/Orders/OrderSearch'
import OrderTable from '../../../components/Orders/OrderTable'
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { useEffect, useState } from 'react';
import { ACCOUNT_ID, FROM_DATE_TIME, SOCKET_CONNECTED, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp } from '../../../helper/utils';
import { IParamHistorySearch } from '../../../interfaces';
import { DEFAULT_SEARCH_HISTORY } from '../../../mocks';

const OrderHistory = () => {
    const [listOrderHistory, setListOrderHistory] = useState([]);
    const [paramHistorySearch, setParamHistorySearch] = useState<IParamHistorySearch>(DEFAULT_SEARCH_HISTORY);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();
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

    const sendListOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        const today = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-${new Date().getDate()}`;

        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();
            orderHistoryRequest.setAccountId(Number(accountId));
            orderHistoryRequest.setFromDatetime(convertDatetoTimeStamp(today, FROM_DATE_TIME));
            orderHistoryRequest.setToDatetime(convertDatetoTimeStamp(today, TO_DATE_TIME));
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
            rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleSearch = (item: IParamHistorySearch) => {
        setParamHistorySearch(item);
    }

    const _renderOrderHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <OrderHistorySearch paramSearch={handleSearch} />
                        <OrderTable
                            listOrderHistory={listOrderHistory}
                            paramHistorySearch={paramHistorySearch} />
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