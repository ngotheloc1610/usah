import { MOCKDATA_ORDER_BOOK_DETAIL } from '../../../../mocks';
import './OrderBookTickerDetail.css';

const mockDataTickerDetail = MOCKDATA_ORDER_BOOK_DETAIL;
const OrderBookTickerDetail = () => (
    <>
        <div className="card-header">
            <h6 className="card-title mb-0">{mockDataTickerDetail.tickerName}</h6>
        </div>
        <div className="card-body">
            <div className="row">
                <div className="col-3">
                    <table className="table table-sm table-borderless table-py-0 mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Last price</strong></td>
                                <td className="text-end">{mockDataTickerDetail.lastPrice}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Open</strong></td>
                                <td className="text-end">{mockDataTickerDetail.open}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">High</strong></td>
                                <td className="text-end">{mockDataTickerDetail.high}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Low</strong></td>
                                <td className="text-end">{mockDataTickerDetail.low}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-6">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Change</strong></td>
                                <td className="text-end">{mockDataTickerDetail.change}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Change%</strong></td>
                                <td className="text-end">{mockDataTickerDetail.changePercent}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Daily Trading Vol</strong></td>
                                <td className="text-end">{mockDataTickerDetail.dailyTradingVol}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">5-Day Average Trading Vol</strong></td>
                                <td className="text-end">{mockDataTickerDetail.averageTradingVol}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-3">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">VWAP</strong></td>
                                <td className="text-end">{mockDataTickerDetail.vwap}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Lot Size</strong></td>
                                <td className="text-end">{mockDataTickerDetail.lotSize}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Floor</strong></td>
                                <td className="text-end">{mockDataTickerDetail.floor}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Ceiling</strong></td>
                                <td className="text-end">{mockDataTickerDetail.ceiling}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
)
export default OrderBookTickerDetail;