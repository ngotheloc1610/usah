import OrderDashboard from "../../components/OrderDashboard"

const Dashboard = () => {

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
                    <div className="col-md-7">
                        <OrderDashboard />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Dashboard