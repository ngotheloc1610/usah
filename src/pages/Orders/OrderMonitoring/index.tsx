import "./orderMonitoring.css";
import React, { useEffect, useState } from "react";
import ListTicker from "../../../components/Orders/ListTicker";
import ListOrder from "../../../components/Orders/ListOrder";
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
const OrderMonitoring = () => {
    const [getDataOrder, setGetDataOrder] = useState([]);
    useEffect(() => {
        setInterval(() => {
            getListData();
            callWs();
        }, 500)
    }, []);

    const callWs = () => {
        setTimeout(() => {
            sendListOrder();
        }, 500)
    }

    const sendListOrder = () => {
        const uid = process.env.REACT_APP_TRADING_ID;
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            orderRequest.setAccountId(uid);
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setPayloadData(orderRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }
    const getListData = () => {
        wsService.getListOrder().subscribe(setGetDataOrder);
    }

    return (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="row align-items-stretch g-2 mb-3">
                        <div className="col-lg-9">
                            <div className="row mb-2">
                                <div className="col-lg-6">
                                    <div className="input-group input-group-sm">
                                        <input type="text" className="form-control form-control-sm border-end-0" value="" placeholder="Add a ticker" />
                                        <button className="btn btn-primary">Add</button>
                                    </div>
                                </div>
                            </div>
                            <ListTicker />
                        </div>
                        <div className="col-lg-3 d-flex">
                            <div className="me-2 h-100 d-flex align-items-center">
                                <button className="btn btn-sm btn-outline-secondary px-1 py-3">
                                    <i className="bi bi-chevron-double-right" />
                                </button>
                            </div>
                            <div className="card flex-grow-1 card-order-form mb-2">
                                <div className="card-header">
                                    <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                </div>
                                <div className="card-body">
                                    {/* new order dùng chung */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <ListOrder listOrder={getDataOrder} />
                </div>
            </div>
        </div>
    )
}


export default OrderMonitoring