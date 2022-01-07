import { useState } from 'react'
import OrderBook from '../../../components/Order/OrderBook'
import OrderForm from '../../../components/Order/OrderForm'
import TickerDetail from '../../../components/Order/TickerDetail'
import TickerSearch from '../../../components/Order/TickerSearch'
import { ITickerInfo } from '../../../interfaces/order.interface'
import { LIST_TICKER_INFOR_MOCK_DATA } from '../../../mocks'
import './OrderNew.scss'

const OrderNew = () => {

    const defaultTickerData: ITickerInfo | any = {
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

    const [currentTicker, setCurrentTicker] = useState(defaultTickerData);

    const getTicker = (value: string) => {
        const item = LIST_TICKER_INFOR_MOCK_DATA.find((o: ITickerInfo) => o.symbolId.toString() === value);
        setCurrentTicker(item);
    }

    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">New Order</h6>
                </div>
                <TickerSearch handleTicker={getTicker} />
                <div className="card-body">
                    <div className="row align-items-stretch">
                        <div className="col-lg-9 col-md-8 border-end">
                            <TickerDetail currentTicker={currentTicker} />
                            <div className="row justify-content-center">
                                <div className="col-xl-5 col-lg-6">
                                    <OrderForm currentTicker={currentTicker} />
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