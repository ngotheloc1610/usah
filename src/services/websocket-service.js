import rpc from '../model/proto/rpc_pb';
import pricingService from '../models/proto/pricing_service_pb';
import tradingService from '../models/proto/trading_service_pb';

import { Subject } from 'rxjs';

const socket_url = window.ws_url;
var socket = null;
var wsConnected = false;

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
            // console.log(quoteEvent.toObject());                
            quoteSubject.next(quoteEvent.toObject());
        }else console.log("payload = " + payloadClass);

        if(payloadClass === rpc.RpcMessage.Payload.NEW_ORDER_SINGLE_RES){
            const singleOrderRes = tradingService.NewOrderSingleResponse.deserializeBinary(msg.getPayloadData());
            console.log(singleOrderRes.toObject());
            orderSubject.next(singleOrderRes.toObject());
        }
    }
}

startWs();

export const wsService = {
    getQuoteSubject: () => quoteSubject.asObservable(),
    getOrderSubject: () => orderSubject.asObservable(),
    sendMessage: message => socket.send(message),
    getWsConnected: () => wsConnected
}