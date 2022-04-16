import rpc from '../models/proto/rpc_pb';
import pricingService from '../models/proto/pricing_service_pb';
import tradingService from '../models/proto/trading_service_pb';
import * as queryService from  '../models/proto/query_service_pb';
import systemService from '../models/proto/system_service_pb';
import { Subject } from 'rxjs';
import ReduxPersist from '../config/ReduxPersist';
import queryString from 'query-string';
import { TOKEN } from '../constants/general.constant';
import { KEY_LOCAL_STORAGE, ACCOUNT_ID, EXPIRE_TIME, ROLE, POEM_ID } from '../constants/general.constant';
import { toast } from 'react-toastify';

const url = process.env.REACT_APP_BASE_URL;
let token = process.env.REACT_APP_TOKEN;
var socket = null;
var wsConnected = false;
// var dataLastQuotes = {quotesList: []};

const loginSubject = new Subject();
const quoteSubject = new Subject();
const orderSubject = new Subject();
const multiOrderSubject = new Subject();
const symbolListSubject = new Subject();
const listOrderSubject = new Subject();
const dataLastQuotes = new Subject();
const orderHistorySubject = new Subject();
const tradeHistorySubject = new Subject();
const accountPortfolioSubject = new Subject();
const paramStr = window.location.search;
const modifySubject = new Subject();
const cancelSubject = new Subject();
const customerInfoDetailSubject = new Subject();
const customerSettingSubject = new Subject();
const socketSubject = new Subject();
const unsubscribeQuoteSubject = new Subject();
const subscribeQuoteSubject = new Subject();
const subscribeTradeEventSubject = new Subject();
const unsubscribeTradeEventSubject = new Subject();
const tradeSubject = new Subject();
const objAuthen = queryString.parse(paramStr);
const startWs = async () => {
    
    const token = localStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN);
    if (!token) {
        return;
    }
    const socket_url = `${url}?token=${token}`;
    socket = new WebSocket(socket_url);
    socket.binaryType = "arraybuffer";
    socket.onopen = () =>{
        console.log("websocket connected");
        wsConnected = true;
        socketSubject.next('SOCKET_CONNECTED');
    }
    
    socket.onerror = () => {
        socket.close();
        wsConnected = false;
        // TODO: navigate to login screen when expired token
        localStorage.removeItem(ACCOUNT_ID);
        localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
        localStorage.removeItem(EXPIRE_TIME);
        localStorage.removeItem(ROLE);
        localStorage.removeItem(POEM_ID);
        toast.error('Invalid Token');
        // Time to display notification error is 3s
        setTimeout(()=> {
            window.location.href = '/login';
        }, 3000);
    }
    
    socket.onclose = () => {
        console.log("websocket closed -> reconnect websocket");
        socketSubject.next('SOCKET_DISCONNECT');
        wsConnected = false;
        setTimeout(function(){startWs()}, 5000);
    }
    
    socket.onmessage = (e) => {
        const msg = rpc.RpcMessage.deserializeBinary(e.data);
        const payloadClass = msg.getPayloadClass();
        if(payloadClass === rpc.RpcMessage.Payload.QUOTE_EVENT){
            const quoteEvent = pricingService.QuoteEvent.deserializeBinary(msg.getPayloadData());     
            quoteSubject.next(quoteEvent.toObject());
        }

        if (payloadClass === rpc.RpcMessage.Payload.TRADE_EVENT) {
            const tradeEvent = tradingService.TradeEvent.deserializeBinary(msg.getPayloadData());
            tradeSubject.next(tradeEvent.toObject());
        }

        if(payloadClass === rpc.RpcMessage.Payload.NEW_ORDER_SINGLE_RES){
            const singleOrderRes = tradingService.NewOrderSingleResponse.deserializeBinary(msg.getPayloadData());
            orderSubject.next(singleOrderRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.ORDER_LIST_RES) {
            const listOrderRes = queryService.GetOrderResponse.deserializeBinary(msg.getPayloadData());
            listOrderSubject.next(listOrderRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.LAST_QUOTE_RES) {
            const lastQuoteRes = pricingService.GetLastQuotesResponse.deserializeBinary(msg.getPayloadData());
            dataLastQuotes.next(lastQuoteRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.MODIFY_ORDER_RES) {
            const modifyRes = tradingService.ModifyOrderResponse.deserializeBinary(msg.getPayloadData());
            modifySubject.next(modifyRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.CANCEL_ORDER_RES) {
            const cancelRes = tradingService.CancelOrderResponse.deserializeBinary(msg.getPayloadData());
            cancelSubject.next(cancelRes.toObject());
        }        
        if (payloadClass === rpc.RpcMessage.Payload.ORDER_HISTORY_RES) {
            const listOrderHistoryRes = queryService.GetOrderHistoryResponse.deserializeBinary(msg.getPayloadData());
            orderHistorySubject.next(listOrderHistoryRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.TRADE_HISTORY_RES) {
            const tradeHistory = queryService.GetTradeHistoryResponse.deserializeBinary(msg.getPayloadData());
            tradeHistorySubject.next(tradeHistory.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.ACCOUNT_PORTFOLIO_RES) {
            const accountPortfolio = systemService.AccountPortfolioResponse.deserializeBinary(msg.getPayloadData());
            accountPortfolioSubject.next(accountPortfolio.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.ACCOUNT_DETAIL_RES) {
            const customerInfoDetail = systemService.AccountDetailResponse.deserializeBinary(msg.getPayloadData());
            customerInfoDetailSubject.next(customerInfoDetail.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.ACCOUNT_UPDATE_RES) {
            const customerSetting = systemService.AccountUpdateResponse.deserializeBinary(msg.getPayloadData());
            customerSettingSubject.next(customerSetting.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.SYMBOL_LIST_RES) {
            const symbolListRes = queryService.SymbolListResponse.deserializeBinary(msg.getPayloadData());
            symbolListSubject.next(symbolListRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.NEW_ORDER_MULTI_RES) {
            const multiOrderRes = tradingService.NewOrderMultiResponse.deserializeBinary(msg.getPayloadData());
            multiOrderSubject.next(multiOrderRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_RES) {
            const unsubscribeQuoteRes = pricingService.UnsubscribeQuoteEventResponse.deserializeBinary(msg.getPayloadData());
            unsubscribeQuoteSubject.next(unsubscribeQuoteRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_RES) {
            const subscribeQuoteRes = pricingService.SubscribeQuoteEventResponse.deserializeBinary(msg.getPayloadData());
            subscribeQuoteSubject.next(subscribeQuoteRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.SUBSCRIBE_TRADE_RES) {
            const subscrbeTradeRes = tradingService.SubscribeTradeEventResponse.deserializeBinary(msg.getPayloadData());
            subscribeTradeEventSubject.next(subscrbeTradeRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.UNSUBSCRIBE_TRADE_RES) {
            const unsubscrbeTradeRes = tradingService.UnsubscribeTradeEventResponse.deserializeBinary(msg.getPayloadData());
            unsubscribeTradeEventSubject.next(unsubscrbeTradeRes.toObject());
        }
    }
}

startWs();

export const wsService = {
    getLoginResponse: () => loginSubject.asObservable(),
    getQuoteSubject: () => quoteSubject.asObservable(),
    getSymbolListSubject: () => symbolListSubject.asObservable(),
    getOrderSubject: () => orderSubject.asObservable(),
    getListOrder: () => listOrderSubject.asObservable(),
    getListOrderHistory: () => orderHistorySubject.asObservable(),
    getTradeHistory: () => tradeHistorySubject.asObservable(),
    getAccountPortfolio: () => accountPortfolioSubject.asObservable(),
    getModifySubject: () => modifySubject.asObservable(),
    getCancelSubject: () => cancelSubject.asObservable(),
    getCustomerInfoDetail: () => customerInfoDetailSubject.asObservable(),
    getCustomerSettingSubject: () => customerSettingSubject.asObservable(),
    sendMessage: message => socket.send(message),
    getWsConnected: () => wsConnected,
    getDataLastQuotes: () => dataLastQuotes.asObservable(),
    getSocketSubject: () => socketSubject.asObservable(),
    getMultiOrderSubject: () => multiOrderSubject.asObservable(),
    getUnsubscribeQuoteSubject: () => unsubscribeQuoteSubject.asObservable(),
    getSubscribeQuoteSubject: () => subscribeQuoteSubject.asObservable(),
    getSubscribeTradeSubject: () => subscribeTradeEventSubject.asObservable(),
    getUnsubscribeTradeSubject: () => unsubscribeTradeEventSubject.asObservable(),
    getTradeEvent: () => tradeSubject.asObservable()

}