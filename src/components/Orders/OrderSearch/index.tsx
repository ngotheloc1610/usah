import { useState, useEffect } from 'react'
import { IParamHistorySearch } from '../../../interfaces/order.interface'
import { ORDER_HISTORY_SEARCH_STATUS } from '../../../mocks'


function OrderHistorySearch(props: any) {
    const { getDataFromOrderHistorySearch } = props

    const [ticker, setTicker] = useState('')
    const [orderStatus, setOrderStatus] = useState('')
    const [orderSideBuy, setOrderSideBuy] = useState(false)
    const [orderSideSell, setOrderSideSell] = useState(false)
    const [dateTimeFrom, setDateTimeFrom] = useState('')
    const [dateTimeTo, setDateTimeTo] = useState('')
    
    const dataParam: IParamHistorySearch = {
        ticker,
        orderStatus,
        orderSideSell,
        orderSideBuy,
        dateTimeFrom,
        dateTimeTo,
    }

    const handleSearch = () => {
        getDataFromOrderHistorySearch(dataParam)
    }

    const _renderTicker = () => (
        <div className="col-xl-3">
            <label className="d-block text-secondary mb-1">Ticker</label>
            <input type="text" className="form-control form-control-sm"
                value={ticker}
                onChange={(event) => setTicker(event.target.value)}
            />
        </div>
    )

    const _renderOrderStatus = () => (
        <div className="col-xl-2">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Status</label>
            <select className="form-select form-select-sm" onChange={(event) => setOrderStatus(event.target.value)}>
                {ORDER_HISTORY_SEARCH_STATUS.map((item: any) =>( <option value={item.code} key={item.code}>{item.name}</option>))}
            </select>
        </div>
    )

    const handleChangeSell = (event: any) => {
        setOrderSideSell(event.target.checked)
    }
    const handleChangeBuy = (event: any) => {
        setOrderSideBuy(event.target.checked)
    }

    const _renderOrderSide = () => (
        <div className="col-xl-2 pl-30">
            <label htmlFor="Groups" className="d-block text-secondary mb-1"> Order Side</label>
            <div className="padding-top-5">

                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" value="Sell" id="sell" onChange={handleChangeSell} />
                    <label className="form-check-label" htmlFor="sell">Sell</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" value="Buy" id="buy" onChange={handleChangeBuy} />
                    <label className="form-check-label" htmlFor="buy">Buy</label>
                </div>
            </div>
        </div>
    )
    const _renderDateTime = () => (
        <div className="col-xl-4">
            <label htmlFor="CreatDateTime" className="d-block text-secondary mb-1"> Datetime</label>
            <div className="row g-2">
                <div className="col-md-6">
                    <div className="input-group input-group-sm">
                        <input type="text" className="form-control form-control-sm border-end-0 date-picker" placeholder="MM/DD/YYYY"
                            value={dateTimeFrom}
                            onChange={(event) => setDateTimeFrom(event.target.value)}
                        />
                        <span className="input-group-text bg-white"><i className="bi bi-calendar"></i></span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="input-group input-group-sm">
                        <input type="text" className="form-control form-control-sm border-end-0 date-picker" placeholder="MM/DD/YYYY"
                            value={dateTimeTo}
                            onChange={(event) => setDateTimeTo(event.target.value)}
                        />
                        <span className="input-group-text bg-white"><i className="bi bi-calendar"></i></span>
                    </div>
                </div>
            </div>
        </div>
    )


    const _renderTemplate = () => (
        <>
            <div className="card-header">
                <h6 className="card-title fs-6 mb-0">Order History</h6>
            </div>
            <div className="card-body bg-gradient-light">
                <div className="row g-2 align-items-end">
                    {_renderTicker()}
                    {_renderOrderStatus()}
                    {_renderOrderSide()}
                    {_renderDateTime()}
                    <div className="col-xl-1 mb-2 mb-xl-0">
                        <a href="#" className="btn btn-sm d-block btn-primary" onClick={handleSearch}><strong>Search</strong></a>
                    </div>
                </div>
            </div>
        </>
    )

    return (
        <>
            {_renderTemplate()}
        </>
    )
}

export default OrderHistorySearch
