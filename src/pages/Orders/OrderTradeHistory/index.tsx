import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import SearchTradeHistory from './SearchTradeHistory'
import TableTradeHistory from './TableTradeHistory'
import '../OrderHistory/orderHistory.scss'
import { useState, useEffect } from 'react';
import { SOCKET_CONNECTED } from '../../../constants/general.constant';
const OrderTradeHistory = () => {
    const [getDataTradeHistory, setGetDataTradeHistory] = useState([]);
    
    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessage();;
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

    const prepareMessage = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();
            tradeHistoryRequest.setAccountId(Number(accountId));
            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMessage = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem('objAuthen', JSON.stringify(objAuthen).toString());
                prepareMessage(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem('objAuthen').then(res => {
            if (res) {
                const obj = JSON.parse(res);
                accountId = obj.account_id;
                prepareMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ?? '';
                prepareMessage(accountId);
                return;
            }
        });
    }

    const _renderTradeHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <SearchTradeHistory />
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