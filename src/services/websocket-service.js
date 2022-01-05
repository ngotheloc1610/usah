import rpc from '../models/proto/rpc_pb';
import pricingService from '../models/proto/pricing_service_pb';
import tradingService from '../models/proto/trading_service_pb';

import { Subject } from 'rxjs';
const url = process.env.REACT_APP_BASE_URL;
const token = process.env.REACT_APP_TOKEN;
const socket_url = `${url}?token=${token}`;
var socket = null;
var wsConnected = false;
var dataLastQuotes = {quotesList: []};

const quoteSubject = new Subject();
const orderSubject = new Subject();

const startWs = () =>{
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
        if(payloadClass === rpc.RpcMessage.Payload.QUOTE_EVENT){
            const quoteEvent = pricingService.QuoteEvent.deserializeBinary(msg.getPayloadData());     
            quoteSubject.next(quoteEvent.toObject());
        }else console.log("payload = " + payloadClass);

        if(payloadClass === rpc.RpcMessage.Payload.NEW_ORDER_SINGLE_RES){
            const singleOrderRes = tradingService.NewOrderSingleResponse.deserializeBinary(msg.getPayloadData());
            console.log(singleOrderRes.toObject());
            orderSubject.next(singleOrderRes.toObject());
        }

        if (payloadClass === rpc.RpcMessage.Payload.LAST_QUOTE_RES) {
            const lastQuoteRes = pricingService.GetLastQuotesResponse.deserializeBinary(msg.getPayloadData());
            dataLastQuotes = lastQuoteRes.toObject();
            orderSubject.next(lastQuoteRes.toObject());
        }
        
    }
}

startWs();

export const wsService = {
    getQuoteSubject: () => quoteSubject.asObservable(),
    getOrderSubject: () => orderSubject.asObservable(),
    sendMessage: message => socket.send(message),
    getWsConnected: () => wsConnected,
    getDataLastQuotes: () => dataLastQuotes
}