import { useState } from "react"
import OrderBook from "../../components/Order/OrderBook"
import OrderForm from "../../components/Order/OrderForm"
import StockInfo from "../../components/Order/StockInfo"
import TickerDashboard from "../../components/TickerDashboard"
import { ITickerInfo } from "../../interfaces/order.interface"

const defaultTickerInfo: ITickerInfo = {
    symbolId: 0,
    tickerName: '',
    ticker: '',
    stockPrice: '',
    previousClose: '',
    open: '',
    high: '',
    low: '',
    lastPrice: '',
    volume: '',
    change: '',
    changePrecent: '',
}

const Dashboard = () => {
    const [isDashboard, setIsDashboard] = useState(true)
    const [ticker, setTicker] = useState(defaultTickerInfo)
    const [msgSuccess, setMsgSuccess] = useState<string>('')
    const setGeneralTemplate = () => (
        <div className="mb-3 row">
            <div className="d-flex justify-content-center align-items-center col-md-4">
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Matched Orders</div>
                    <div>36</div>
                </div>
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Pending Order</div>
                    <div>36</div>
                </div>
                <div className="text-center flex-grow-1 px-3">
                    <div className="small fw-bold">% P/L</div>
                    <div className="text-success">4.56%</div>
                </div>
            </div>
            <div className="col-md-4"></div>
            <div className="small text-end col-md-4">
                <div>US 01:19:03 PM</div>
                <div className="d-flex align-items-center justify-content-end">
                    <select className="form-select form-select-sm lh-1 me-2" style={{ width: '4rem' }}>
                        <option>Zone</option>
                        <option value="1" >SG</option>
                        <option value="2">JP</option>
                    </select>
                    <span>02:19:03 AM</span>
                </div>
            </div>
        </div>
    )

    const getTickerInfo = (value: ITickerInfo) => {
        setTicker(value);
    }

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
    }
    return (
        <div className="site-main">
            <div className="container">
                {setGeneralTemplate()}
                <div className="row">
                    <div className="col-lg-7">
                        <TickerDashboard handleTickerInfo={getTickerInfo} />
                    </div>
                    <div className="col-lg-2">
                        <div>
                            <OrderBook isDashboard={isDashboard}/>
                        </div>
                        <div>
                            <StockInfo />
                        </div>
                    </div>
                    <div className="col-lg-3">
                    <div className="card flex-grow-1">
                            <div className="card-header">
                                <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                            </div>
                            <div className="card-body" style={{height: '500px'}}>
                                <OrderForm isDashboard={isDashboard} currentTicker={ticker} messageSuccess={messageSuccess} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard