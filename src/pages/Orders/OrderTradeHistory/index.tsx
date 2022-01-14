import { IParamTradeSearch } from '../../../interfaces/order.interface'
import { LIST_TICKER_INFOR_MOCK_DATA } from '../../../mocks'
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import SearchTradeHistory from './SearchTradeHistory'
import TableTradeHistory from './TableTradeHistory'
import '../OrderHistory/orderHistory.scss'
import { useState, useEffect } from 'react';
const OrderTradeHistory = () => {
    const [getDataTradeHistory, setGetDataTradeHistory] = useState([]);
    const [tradeSearch, setTradeSearch] = useState({
        ticker: '',
        orderSideSell: false,
        orderSideBuy: false,
        dateTimeFrom: '',
        dateTimeTo: '',
    })

    const { ticker, orderSideSell, orderSideBuy, dateTimeFrom, dateTimeTo } = tradeSearch

    const getDataFromTradeSearch = (getDataFromTradeSearch: IParamTradeSearch) => {
        setTradeSearch(getDataFromTradeSearch)
    }

    const getParamOrderSide = () => {
        if (orderSideSell === true && orderSideBuy === false) {
            return 1
        }
        else if (orderSideSell === false && orderSideBuy === true) {
            return 2
        }
        else {
            return 0
        }
    }

    useEffect(() => {
        const renderDataToScreen = wsService.getTradeHistory().subscribe(res => {
            setGetDataTradeHistory(res.tradeList)
        });

        return () => renderDataToScreen.unsubscribe();  
    }, [tradeSearch] )

    useEffect(() => { 
        callWs(); 
    }, []);

    const callWs = () => {
        setTimeout(() => {
            sendMessage();
        }, 500)
    }

    const prepareMessagee = (accountId: string ) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();  
            tradeHistoryRequest.setAccountId(Number(accountId));

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());  
        }
    }

    const sendMessage = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string = '' ;
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem('objAuthen', JSON.stringify(objAuthen).toString());
                prepareMessagee(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem('objAuthen').then(res => {
            if (res) {
                const obj = JSON.parse(res);
                accountId = obj.account_id;
                prepareMessagee(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ?? '';
                prepareMessagee(accountId);
                return;
            }
        });
    }


    const _renderTradeHistory = () => {
        return (
            <div className='site'>
                <div className="site-main">
                    <div className="container">
                        <div className="card shadow-sm mb-3">
                            <SearchTradeHistory getDataFromTradeSearch = { getDataFromTradeSearch } />
                            <TableTradeHistory getDataTradeHistory = { getDataTradeHistory } />
                        </div>
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