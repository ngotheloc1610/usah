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
            if (resp === SOCKET_CONNECTED) {
                sendTradeHistoryReq(symbolCode, fromDate, toDate);
            }
        });

        const tradeHistoryRes = wsService.getTradeHistory().subscribe(res => {
            let resTradeList = res?.tradeList;
            if (orderSide !== 0) {
                resTradeList = resTradeList.filter(item => item.side === orderSide);
            }
            setDataTradeHistory(resTradeList);
        });

        return () => {
            ws.unsubscribe();
            tradeHistoryRes.unsubscribe();
        };
    }, [])

    const sendTradeHistoryReq = (symbolCodeSeach: string, fromDateSearch: number, toDateSearch: number) => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';

        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();
            tradeHistoryRequest.setAccountId(Number(accountId));
            tradeHistoryRequest.setSymbolCode(symbolCodeSeach);
            tradeHistoryRequest.setFromDatetime(fromDateSearch);
            tradeHistoryRequest.setToDatetime(toDateSearch);
            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getParamSearch = (param: IParamSearchTradeHistory) => {
        setOrderSide(param.side);
        sendTradeHistoryReq(param.symbolCode, param.fromDate, param.toDate);
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