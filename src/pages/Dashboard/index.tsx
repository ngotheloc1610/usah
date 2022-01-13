import { useState } from "react"
import OrderBook from "../../components/Order/OrderBook"
import OrderForm from "../../components/Order/OrderForm"
import StockInfo from "../../components/Order/StockInfo"
import TickerDashboard from "../../components/TickerDashboard"

const Dashboard = () => {
    const [isDashboard, setIsDashboard] = useState(true)
    const setGeneralTemplate = () => (
        <div className="mb-3 d-flex justify-content-between">
            <div className="d-flex justify-content-center align-items-center">
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Matched Orders</div>
                    <div>36</div>
                </div>
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Pending Order</div>
                    <div>36</div>
                </div>
                <div className="text-center flex-grow-1 px-3">
                    <div className="small fw-bold">% Unrealized P/L</div>
                    <div className="text-success">4.56%</div>
                </div>
            </div>
            <div className="small text-end">
                <div>US 01:19:03 PM</div>
                <div className="d-flex align-items-center">
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

    return (
        <div className="site-main">
            <div className="container">
                {setGeneralTemplate()}
                <div className="row">
                    <div className="col-lg-7">
                        <TickerDashboard />
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
                                <OrderForm isDashboard={isDashboard} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Dashboard