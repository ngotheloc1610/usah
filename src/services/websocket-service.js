import rpc from '../models/proto/rpc_pb';
import pricingService from '../models/proto/pricing_service_pb';
import tradingService from '../models/proto/trading_service_pb';
import * as queryService from  '../models/proto/query_service_pb';

import { Subject } from 'rxjs';

const socket_url = "ws://10.1.11.36:8769/api/v1/websocket?token=355d13f7f64b0d34888bbc9f5f942cd0b39dc57482850519ff6392da95afffe8";
var socket = null;
var wsConnected = false;

const quoteSubject = new Subject();
const orderSubject = new Subject();
const listOrderSubject = new Subject();

const startWs = () =>{
    debugger;
    socket = new WebSocket(socket_url);
    socket.binaryType = "arraybuffer";
    console.log(19, socket);
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
        console.log(38, msg);

        const payloadClass = msg.getPayloadClass();
        console.log(42, payloadClass);
        // if(payloadClass === rpc.RpcMessage.Payload.QUOTE_EVENT){
        //     const quoteEvent = pricingService.QuoteEvent.deserializeBinary(msg.getPayloadData());
        //     // console.log(quoteEvent.toObject());                
        //     quoteSubject.next(quoteEvent.toObject());
        // }

        // if(payloadClass === rpc.RpcMessage.Payload.NEW_ORDER_SINGLE_RES){
        //     const singleOrderRes = tradingService.NewOrderSingleResponse.deserializeBinary(msg.getPayloadData());
        //     console.log(singleOrderRes.toObject());
        //     orderSubject.next(singleOrderRes.toObject());
        // }
        if (payloadClass === rpc.RpcMessage.Payload.ORDER_LIST_RES) {
            const listOrderRes = queryService.GetOrderResponse.deserializeBinary(msg.getPayloadData());
            console.log(listOrderRes.toObject());
            listOrderSubject.next(listOrderRes.toObject().orderList);
        }
    }
}

startWs();

export const wsService = {
    getQuoteSubject: () => quoteSubject.asObservable(),
    getOrderSubject: () => orderSubject.asObservable(),
    getListOrderSubject: () => listOrderSubject.asObservable(), 
    sendMessage: message => socket.send(message),
    getWsConnected: () => wsConnected
    
}