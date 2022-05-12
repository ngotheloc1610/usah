import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import SearchTradeHistory from './SearchTradeHistory'
import TableTradeHistory from './TableTradeHistory'
import '../OrderHistory/orderHistory.scss'
import { useState, useEffect } from 'react';
import { ACCOUNT_ID, FROM_DATE_TIME, SOCKET_CONNECTED, SOCKET_RECONNECTED, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp, convertNumber } from '../../../helper/utils';
import { IListTradeHistory, IParamSearchTradeHistory } from "../../../interfaces/order.interface";

const OrderTradeHistory = () => {
    const [getDataTradeHistory, setDataTradeHistory] = useState<IListTradeHistory[]>([]);
    const [getDataTradeHistoryRes, setDataTradeHistoryRes] = useState<IListTradeHistory[]>([]);
    const [orderSide, setOrderSide] = useState(0);
    const [symbolCode, setSymbolCode] = useState('');
    
    const today = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-${new Date().getDate()}`;

    const [fromDate, setFromDate] = useState(convertDatetoTimeStamp(today, FROM_DATE_TIME));
    const [toDate, setToDate] = useState(convertDatetoTimeStamp(today, TO_DATE_TIME));

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendTradeHistoryReq();
            }
        });

        const tradeHistoryRes = wsService.getTradeHistory().subscribe(res => {
            setDataTradeHistoryRes(res?.tradeList);
        });

        return () => {
            ws.unsubscribe();
            tradeHistoryRes.unsubscribe();
        };
    }, [])

    useEffect(() => {
        let tmpLstTradeHistory = [...getDataTradeHistoryRes];
        if (orderSide !== 0) {
            tmpLstTradeHistory = tmpLstTradeHistory.filter(item => item.side === orderSide);
        }
        if (symbolCode) {
            tmpLstTradeHistory = tmpLstTradeHistory.filter(item => item.tickerCode === symbolCode);
        }
        if (convertNumber(fromDate) > 0) {
            tmpLstTradeHistory = tmpLstTradeHistory.filter(item => Number(item.executedDatetime) >= fromDate);
        }
        if (convertNumber(toDate) > 0) {
            tmpLstTradeHistory = tmpLstTradeHistory.filter(item => Number(item.executedDatetime) <= toDate);
        }
        setDataTradeHistory(tmpLstTradeHistory);
    }, [orderSide, symbolCode, fromDate, toDate, getDataTradeHistoryRes])

    const sendTradeHistoryReq = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';

        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();
            tradeHistoryRequest.setAccountId(Number(accountId));
            // Front-end is doing filter so fromDate = 0 to get all data
            tradeHistoryRequest.setFromDatetime(0);
            tradeHistoryRequest.setToDatetime(convertDatetoTimeStamp(today, TO_DATE_TIME));
            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getParamSearch = (param: IParamSearchTradeHistory) => {
        setSymbolCode(param.symbolCode);
        setFromDate(param.fromDate);
        setToDate(param.toDate);
        setOrderSide(param.side);
    }
    const _renderTradeHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <SearchTradeHistory getParamSearch={getParamSearch}/>
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