import "./orderMonitoring.css";
import React, { useEffect } from "react";
import ListTicker from "../../../components/Orders/ListTicker";
import ListOrder from "../../../components/Orders/ListOrder";
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
// import { error } from "../../../models/notify";
import * as rspb from "../../../models/proto/rpc_pb";
const OrderMonitoring = () => {

    const sendListOrder = () => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        console.log(14, wsConnected);
        debugger;
        let currentDate = new Date();
        let orderRequest = new queryServicePb.GetOrderRequest();
        orderRequest.setAccountId('1090231905');
        orderRequest.setSymbolCode('1');
        console.log(22, orderRequest);
        const rpcModel: any = rspb;
        let rpcMsg = new rpcModel.RpcMessage();
        rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
        rpcMsg.setPayloadData(orderRequest.serializeBinary());
        rpcMsg.setContextId(currentDate.getTime());
        console.log(30, rpcMsg);
        wsService.sendMessage(rpcMsg.serializeBinary());
        // } else error(i18n.t("response.wsError"));
    }
    useEffect(() => {
        sendListOrder()
    }, []);
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
                    <ListOrder />
                </div>
            </div>
        </div>
    )
}


export default OrderMonitoring