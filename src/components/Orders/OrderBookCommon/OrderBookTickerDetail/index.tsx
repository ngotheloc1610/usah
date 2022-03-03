import { LIST_TICKER_INFO } from '../../../../constants/general.constant';
import { IPropsDetail } from '../../../../interfaces/order.interface';
import { MOCKDATA_ORDER_BOOK_DETAIL } from '../../../../mocks';
import './OrderBookTickerDetail.css';

const mockDataTickerDetail = MOCKDATA_ORDER_BOOK_DETAIL;
const OrderBookTickerDetail = (props: IPropsDetail) => {
    const { getTickerDetail } = props;
    const getTickerName = (symbolId: string) => {
        const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]');
        return tickerList.find(item => item.symbolId.toString() === symbolId)?.tickerName;
    }

    return <>
        <div className="card-header">
            {getTickerDetail.symbolCode !== "" ? <h6 className="card-title mb-0">{getTickerName(getTickerDetail.symbolCode)}</h6> : <h6 className="card-title mb-0">&nbsp;</h6>}
        </div>
        <div className="card-body">
            <div className="row">
                <div className="col-3">
                    <table className="table table-sm table-borderless table-py-0 mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Last price</strong></td>
                                <td className="text-end">{getTickerDetail.currentPrice}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Open</strong></td>
                                <td className="text-end">{getTickerDetail.open}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">High</strong></td>
                                <td className="text-end">{getTickerDetail.high}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Low</strong></td>
                                <td className="text-end">{getTickerDetail.low}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-6">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Change</strong></td>
                                <td className="text-end">{getTickerDetail.netChange}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Change%</strong></td>
                                <td className="text-end">{getTickerDetail.pctChange}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Daily Trading Vol</strong></td>
                                <td className="text-end">{getTickerDetail.tickPerDay}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">5-Day Average Trading Vol</strong></td>
                                {/* Waiting Proto */}
                                <td className="text-end">{ }</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-3">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">VWAP</strong></td>
                                {/* Waiting Proto */}
                                <td className="text-end">{ }</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Lot Size</strong></td>
                                {/* Waiting Proto */}
                                <td className="text-end">{ }</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Floor</strong></td>
                                {/* Waiting Proto */}
                                <td className="text-end">{ }</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Ceiling</strong></td>
                                {/* Waiting Proto */}
                                <td className="text-end">{ }</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}
export default OrderBookTickerDetail;