import { useState, useEffect } from 'react'

function OrderSearch() {

    return (
        <>
            <div className="card-header">
                <h6 className="card-title fs-6 mb-0">Order History</h6>
            </div>
            <div className="card-body bg-gradient-light">
                <div className="row g-2 align-items-end">
                    <div className="col-xl-3">
                        <label className="d-block text-secondary mb-1">Ticker</label>
                        <input type="text" className="form-control form-control-sm" placeholder="" />
                    </div>

                    <div className="col-xl-2">
                        <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Status</label>
                        <select className="form-select form-select-sm">
                            <option value="0">All</option>
                        </select>
                    </div>

                    <div className="col-xl-2 pl-30">
                        <label htmlFor="Groups" className="d-block text-secondary mb-1"> Order Side</label>
                        <div className="padding-top-5">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="buy" />
                                <label className="form-check-label" htmlFor="buy">Sell</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="sell" />
                                <label className="form-check-label" htmlFor="sell">Buy</label>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <label htmlFor="CreatDateTime" className="d-block text-secondary mb-1"> Datetime</label>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <div className="input-group input-group-sm">
                                    <input type="text" className="form-control form-control-sm border-end-0 date-picker" placeholder="MM/DD/YYYY" />
                                    <span className="input-group-text bg-white"><i className="bi bi-calendar"></i></span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group input-group-sm">
                                    <input type="text" className="form-control form-control-sm border-end-0 date-picker" placeholder="MM/DD/YYYY" />
                                    <span className="input-group-text bg-white"><i className="bi bi-calendar"></i></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-1 mb-2 mb-xl-0">
                        <a href="#" className="btn btn-sm d-block btn-primary"><strong>Search</strong></a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderSearch
