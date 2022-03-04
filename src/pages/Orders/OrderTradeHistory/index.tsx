import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import SearchTradeHistory from './SearchTradeHistory'
import TableTradeHistory from './TableTradeHistory'
import '../OrderHistory/orderHistory.scss'
import { useState, useEffect } from 'react';
import { ACCOUNT_ID, FROM_DATE_TIME, OBJ_AUTHEN, SOCKET_CONNECTED, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp } from '../../../helper/utils';
const OrderTradeHistory = () => {
    const [getDataTradeHistory, setGetDataTradeHistory] = useState([]);
    const [oderSide, setOrderSide] = useState(0)
console.log(15, getDataTradeHistory);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendTradeHistoryReq();;
            }
        });

        const renderDataToScreen = wsService.getTradeHistory().subscribe(res => {
            setGetDataTradeHistory(res.tradeList)
        });

        return () => {
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
        };
    }, [])

    // useEffect(() => {
    //     const xxx = getDataTradeHistory.filter((item: any) => item.orderType === oderSide)
    //     setGetDataTradeHistory(xxx);
        
    // }, [oderSide])

    const getOrderSide = (item: number) => {
        setOrderSide(item)
        const xxx = getDataTradeHistory.filter((o: any) => o.orderType === item)
        setGetDataTradeHistory(xxx);
    }

    const buildMessage = (accountId: string) => {
        const today = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-${new Date().getDate()}`;

        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();
            tradeHistoryRequest.setAccountId(Number(accountId));
            tradeHistoryRequest.setFromDatetime(convertDatetoTimeStamp(today, FROM_DATE_TIME))
            tradeHistoryRequest.setToDatetime(convertDatetoTimeStamp(today, TO_DATE_TIME))
            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendTradeHistoryReq = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessage(accountId);

    }

    const _renderTradeHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <SearchTradeHistory getOrderSide={getOrderSide} />
                        <TableTradeHistory getDataTradeHistory={getDataTradeHistory} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            {_renderTradeHistory()}
        </div>
    )
}
export default OrderTradeHistory