import OrderBook from '../../../components/Order/OrderBook'
import OrderForm from '../../../components/Order/OrderForm'
import TickerDetail from '../../../components/Order/TickerDetail'
import TickerSearch from '../../../components/Order/TickerSearch'
import './OrderNew.scss'

const OrderNew = () => {
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">New Order</h6>
                </div>
                <TickerSearch />
                <div className="card-body">
                    <div className="row align-items-stretch">
                        <div className="col-lg-9 col-md-8 border-end">
                            <TickerDetail />
                            <div className="row justify-content-center">
                                <div className="col-xl-4 col-lg-6">
                                    <OrderForm />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4">
                            <OrderBook />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default OrderNew