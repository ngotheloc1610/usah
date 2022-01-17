import "./orderMonitoring.css";
import { useState } from "react";
import ListTicker from "../../../components/Orders/ListTicker";
import ListOrder from "../../../components/Orders/ListOrder";
import OrderForm from "../../../components/Order/OrderForm";
import { IAskAndBidPrice, ITickerInfo } from "../../../interfaces/order.interface";
import { LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
const defaultCurrentTicker: ITickerInfo | any = {
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
        side: '',
}

const OrderMonitoring = () => {
    const [currentTicker, setCurrentTicker] = useState(defaultCurrentTicker);

    const handleTicker = (item: IAskAndBidPrice) => {
        const tickerData = LIST_TICKER_INFOR_MOCK_DATA.find((itemData: ITickerInfo) => itemData.symbolId === Number(item.symbolCode));
        const itemTicker = {
            tickerName: tickerData?.tickerName,
            ticker: tickerData?.ticker,
            lastPrice: item.price,
            volume: item.volume,
            side: item.side,
            symbolId: item.symbolCode
        }
        setCurrentTicker(itemTicker);
    }

    return (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="row align-items-stretch g-2 mb-3">
                        <div className="col-lg-9">
                            <ListTicker getTicerLastQuote={handleTicker} />
                        </div>
                        <div className="col-lg-3 d-flex">
                            <div className="me-2 h-100 d-flex align-items-center">
                                <button className="btn btn-sm btn-outline-secondary px-1 py-3">
                                    <i className="bi bi-chevron-double-right" />
                                </button>
                            </div>
                            <div className="card flex-grow-1 card-order-form mb-2">
                                <div className="card-header">
                                    <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                </div>
                                <div className="card-body">
                                    <OrderForm currentTicker={currentTicker} />
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