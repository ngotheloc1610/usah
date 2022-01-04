import React, { useState } from "react";

const MewOrder = () => {
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
        <div className="card flex-grow-1 card-order-form mb-2">
            <div className="card-header-new-order">
                <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
            </div>
            <div className="card-body">
                <form action="#" className="order-form">
                    <div className="order-btn-group d-flex align-items-stretch mb-2">
                        <button type="button" onClick={btnBuy} className={`btn btn-buy text-white flex-grow-1 p-2 text-center ${isShowBuy ? "selected" : ""}`}>
                            <span className="fs-5 text-uppercase">Buy</span>
                        </button>
                        <button type="button" onClick={btnSell} className={`btn btn-sell text-white flex-grow-1 p-2 px-2 text-center ${isShowSell ? "selected" : ""}`}>
                            <span className="fs-5 text-uppercase">Sell</span>
                        </button>
                    </div>
                    <ul className="nav nav-tabs nav-tabs-line-bottom mb-2" role="tablist">
                        <li className="nav-item flex-grow-1" role="presentation">
                            <button className="nav-link pt-0 pb-1" id="order-market-tab" data-bs-toggle="tab" data-bs-target="#order-market" type="button" role="tab" aria-controls="normal" aria-selected="true">Market Order</button>
                        </li>
                        <li className="nav-item flex-grow-1" role="presentation">
                            <button className="nav-link pt-0 pb-1 active" id="order-limit-tab" data-bs-toggle="tab" data-bs-target="#order-limit" type="button" role="tab" aria-controls="Order IFD" aria-selected="false">Limit Order</button>
                        </li>
                    </ul>
                    <div className="tab-content">
                        <div className="tab-pane" id="order-market" role="tabpanel" aria-labelledby="order-market-tab">
                            Market
                        </div>
                        <div className="tab-pane show active" id="order-limit" role="tabpanel" aria-labelledby="order-limit-tab">
                            <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                <label className="text text-secondary">Ticker</label>
                                <div className="fs-5">AAPL</div>
                            </div>
                            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                <div className="flex-grow-1 py-1 px-2">
                                    <label className="text text-secondary">Price</label>
                                    <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="145.58" placeholder="" />
                                </div>
                                <div className="border-start d-flex flex-column">
                                    <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                    <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                </div>
                            </div>
                            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                <div className="flex-grow-1 py-1 px-2">
                                    <label className="text text-secondary">Volume</label>
                                    <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="5,000" placeholder="" />
                                </div>
                                <div className="border-start d-flex flex-column">
                                    <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                    <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                </div>
                            </div>
                            <div className="border-top">
                                <a href="#" className="btn btn-placeholder btn-primary d-block fw-bold text-white mb-1">Place</a>
                                <a href="#" className="btn btn-reset btn-outline-secondary d-block fw-bold">Reset</a>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default MewOrder;