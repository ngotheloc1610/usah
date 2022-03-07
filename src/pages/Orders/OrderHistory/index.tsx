import OrderHistorySearch from '../../../components/Orders/OrderSearch'
import OrderTable from '../../../components/Orders/OrderTable'
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { useEffect, useState } from 'react';
import { ACCOUNT_ID, FROM_DATE_TIME, SOCKET_CONNECTED, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp } from '../../../helper/utils';

const OrderHistory = () => {
    const [listOrderHistory, setListOrderHistory] = useState([]);
    const [orderSide, setOrderSide] = useState(0);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();;
            }
        });

        const renderDataToScreen = wsService.getListOrderHistory().subscribe(res => {
            if (orderSide !== 0) {
                const historyListFilter = res.orderList.filter(item => item.orderType === orderSide)
                setListOrderHistory(historyListFilter)
                return
            }
            setListOrderHistory(res.orderList)
        });

        return () => {
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
        }
    }, [orderSide])

    const buildMessage = (accountId: string) => {
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

    const sendListOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessage(accountId);
    }

    const getOrderSide = (item: number) => {
        setOrderSide(item)
    }

    const _renderOrderHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <OrderHistorySearch getOrderSide={getOrderSide} />
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