import "./orderMonitoring.css";
import React, { useState } from "react";
import ListTicker from "../../../components/Orders/ListTicker";
import ListOrder from "../../../components/Orders/ListOrder";
const OrderMonitoring = () => {
    const [isShowBuy, setShowBuy] = useState(true);
    const [isShowSell, setShowSell] = useState(false);
    function btnSell() {
        setShowBuy(false);
        setShowSell(true);
    }
    function btnBuy() {
        setShowBuy(true);
        setShowSell(false);
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
                                <a href="javascript:;" className="btn btn-sm btn-outline-secondary px-1 py-3"><i className="bi bi-chevron-double-right"></i></a>
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