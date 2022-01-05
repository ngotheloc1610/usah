import rpc from '../models/proto/rpc_pb';
import pricingService from '../models/proto/pricing_service_pb';
import tradingService from '../models/proto/trading_service_pb';
import * as queryService from  '../models/proto/query_service_pb';
import { Subject } from 'rxjs';
const url = process.env.REACT_APP_BASE_URL;
const token = process.env.REACT_APP_TOKEN;
const socket_url = `${url}?token=${token}`;
var socket = null;
var wsConnected = false;

const quoteSubject = new Subject();
const orderSubject = new Subject();
const listOrderSubject = new Subject();

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
        console.log(38,payloadClass);
        if(payloadClass === rpc.RpcMessage.Payload.QUOTE_EVENT){
            const quoteEvent = pricingService.QuoteEvent.deserializeBinary(msg.getPayloadData());
            // console.log(quoteEvent.toObject());                
            quoteSubject.next(quoteEvent.toObject());
        }

        if(payloadClass === rpc.RpcMessage.Payload.NEW_ORDER_SINGLE_RES){
            const singleOrderRes = tradingService.NewOrderSingleResponse.deserializeBinary(msg.getPayloadData());
            console.log(singleOrderRes.toObject());
            orderSubject.next(singleOrderRes.toObject());
        }
        if (payloadClass === rpc.RpcMessage.Payload.ORDER_LIST_RES) {
            const listOrderRes = queryService.GetOrderResponse.deserializeBinary(msg.getPayloadData());
            console.log('lstOrderRes:', listOrderRes.toObject().orderList)
            listOrderSubject.next(listOrderRes.toObject().orderList);
        }
    }
}

startWs();

export const wsService = {
    getQuoteSubject: () => quoteSubject.asObservable(),
    getOrderSubject: () => orderSubject.asObservable(),
    getListOrder: () => listOrderSubject.asObservable(),
    sendMessage: message => socket.send(message),
    getWsConnected: () => wsConnected
    
}