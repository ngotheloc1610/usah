import { useState, useEffect } from 'react'
import { ITickerInfo, IHistorySearchStatus } from '../../../interfaces/order.interface'
import { ORDER_HISTORY_SEARCH_STATUS, LIST_TICKER_INFOR_MOCK_DATA } from '../../../mocks'
import * as tmpb from "../../../models/proto/trading_model_pb"
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
function OrderHistorySearch() {

    const [ticker, setTicker] = useState('')
    const [orderState, setOrderState] = useState(0)
    const [orderBuy, setOrderBuy] = useState(false)
    const [orderSell, setOrderSell] = useState(false)
    const [orderType, setOrderType] = useState(0)
    const [fromDatetime, setFromDatetime] = useState(0)
    const [toDatetime, setToDatetime] = useState(0)

    useEffect(() => getParamOrderSide(), [orderBuy, orderSell])

    const handleChangeFromDate = (value: string) => {
        const fromDate = " 00:00:00";
        const newDate = value.concat(fromDate);
        const newDateConvert = Date.parse(newDate) / 1000
        setFromDatetime(newDateConvert)
    }

    const handleChangeToDate = (value: string) => {
        const toDate = " 23:59:59";
        const newDate = value.concat(toDate);
        const newDateConvert = Date.parse(newDate) / 1000
        setToDatetime(newDateConvert)
    }

    const sendMessageOrderHistory = () => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();

            orderHistoryRequest.setSymbolCode(ticker);
            orderHistoryRequest.setOrderType(orderType);
            orderHistoryRequest.setFromDatetime(fromDatetime);
            orderHistoryRequest.setToDatetime(toDatetime);
            orderHistoryRequest.setOrderState(orderState);

            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
            rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleSearch = () => {
        sendMessageOrderHistory()
    }

    const _renderTicker = () => (
        <div className="col-xl-3">
            <label className="d-block text-secondary mb-1">Ticker</label>
            <select className="form-select form-select-sm" onChange={(event: any) => setTicker(event.target.value)}>
                <option value=''></option>
                {LIST_TICKER_INFOR_MOCK_DATA.map((item: ITickerInfo) => <option value={item.symbolId} key={item.symbolId}>{item.tickerName} ({item.ticker})</option>)}
            </select>
        </div>
    )

    const _renderOrderStatus = () => (
        <div className="col-xl-2">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Status</label>
            <select className="form-select form-select-sm" onChange={(event: any) => setOrderState(parseInt(event.target.value))}>
                {ORDER_HISTORY_SEARCH_STATUS.map((item: IHistorySearchStatus) => (<option value={item.code} key={item.code}>{item.name}</option>))}
            </select>
        </div>
    )

    const getParamOrderSide = () => {
        const tradingModelPb: any = tmpb
        if (orderSell === true && orderBuy === false) {
            setOrderType(tradingModelPb.OrderType.OP_SELL)
        }
        else if (orderSell === false && orderBuy === true) {
            setOrderType(tradingModelPb.OrderType.OP_BUY)
        }
        else {
            setOrderType(tradingModelPb.OrderType.ORDER_TYPE_NONE)
        }
    }

    const _renderOrderSide = () => (
        <div className="col-xl-2 pl-30">
            <label htmlFor="Groups" className="d-block text-secondary mb-1"> Order Side</label>
            <div className="padding-top-5">

                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" value="Sell" id="sell" onChange={(event: any) => setOrderSell(event.target.checked)} />
                    <label className="form-check-label" htmlFor="sell">Sell</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" value="Buy" id="buy" onChange={(event: any) => setOrderBuy(event.target.checked)} />
                    <label className="form-check-label" htmlFor="buy">Buy</label>
                </div>
            </div>
        </div>
    )

    const _renderDateTime = () => (
        <div className="col-xl-4">
            <label htmlFor="CreatDateTime" className="d-block text-secondary mb-1"> Datetime</label>
            <div className="row g-2">
                <div className="col-md-5">
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm border-end-0 date-picker"
                            max="9999-12-31"
                            onChange={(event) => handleChangeFromDate(event.target.value)}
                        />
                    </div>
                </div>
                <div className='col-md-1 seperate'>~</div>
                <div className="col-md-5">
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm border-end-0 date-picker"
                            max="9999-12-31"
                            onChange={(event) => handleChangeToDate(event.target.value)}
                        />
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
