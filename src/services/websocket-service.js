import rpc from '../models/proto/rpc_pb';
import pricingService from '../models/proto/pricing_service_pb';
import tradingService from '../models/proto/trading_service_pb';
import * as queryService from  '../models/proto/query_service_pb';
import systemService from '../models/proto/system_service_pb';
import { Subject } from 'rxjs';
import ReduxPersist from '../config/ReduxPersist';
import queryString from 'query-string';
const url = process.env.REACT_APP_BASE_URL;
let token = process.env.REACT_APP_TOKEN;
var socket = null;
var wsConnected = false;
// var dataLastQuotes = {quotesList: []};

const loginSubject = new Subject();
const quoteSubject = new Subject();
const orderSubject = new Subject();
const listOrderSubject = new Subject();
const dataLastQuotes = new Subject();
const orderHistorySubject = new Subject();
const tradeHistorySubject = new Subject();
const accountPortfolioSubject = new Subject();
const paramStr = window.location.search;
const modifySubject = new Subject();
const cancelSubject = new Subject();
const customerInfoDetailSubject = new Subject();
const tradingPinSubject = new Subject();
const objAuthen = queryString.parse(paramStr);
const startWs = async () => {
    if (objAuthen.access_token) {
        token = objAuthen.access_token;
        ReduxPersist.storeConfig.storage.setItem('objAuthen', JSON.stringify(objAuthen));
    } else {
        const objAuthen = await ReduxPersist.storeConfig.storage.getItem('objAuthen');
        if (objAuthen) {
            const obj = JSON.parse(objAuthen);         
            token = obj.access_token;
        }
    }
    const socket_url = `${url}?token=${token}`;
    socket = new WebSocket(socket_url);
    socket.binaryType = "arraybuffer";
    socket.onopen = () =>{
        console.log("websocket connected");
        wsConnected = true;
    }
    
    socket.onerror = () => {
        socket.close();
        wsConnected = false;
    }
    
    socket.onclose = () => {
        console.log("websocket closed -> reconnect websocket");
        wsConnected = false;
        setTimeout(function(){startWs()}, 5000);
    }
    
    socket.onmessage = (e) => {
        const msg = rpc.RpcMessage.deserializeBinary(e.data);
        const payloadClass = msg.getPayloadClass();
        if (payloadClass === rpc.RpcMessage.Payload.AUTHEN_RES){
            const loginRes = systemService.LoginResponse.deserializeBinary(msg.getPayloadData());     
            loginSubject.next(loginRes.toObject());
        } 
        if(payloadClass === rpc.RpcMessage.Payload.QUOTE_EVENT){
            const quoteEvent = pricingService.QuoteEvent.deserializeBinary(msg.getPayloadData());     
            quoteSubject.next(quoteEvent.toObject());
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
            const tradingPin = systemService.AccountUpdateResponse.deserializeBinary(msg.getPayloadData());
            tradingPinSubject.next(tradingPin.toObject());
        }
    }
}

startWs();

export const wsService = {
    getLoginResponse: () => loginSubject.asObservable(),
    getQuoteSubject: () => quoteSubject.asObservable(),
    getOrderSubject: () => orderSubject.asObservable(),
    getListOrder: () => listOrderSubject.asObservable(),
    getListOrderHistory: () => orderHistorySubject.asObservable(),
    getTradeHistory: () => tradeHistorySubject.asObservable(),
    getAccountPortfolio: () => accountPortfolioSubject.asObservable(),
    getModifySubject: () => modifySubject.asObservable(),
    getCancelSubject: () => cancelSubject.asObservable(),
    getCustomerInfoDetail: () => customerInfoDetailSubject.asObservable(),
    getTradingPinSubject: () => tradingPinSubject.asObservable(),
    sendMessage: message => socket.send(message),
    getWsConnected: () => wsConnected,
    getDataLastQuotes: () => dataLastQuotes.asObservable()
}