import './OrderBookTickerDetail.css';
const OrderBookTickerDetail = () => (
    <>
        <div className="card-header">
            <h6 className="card-title mb-0">AAPL</h6>
        </div>
        <div className="card-body">
            <div className="row">
                <div className="col-3">
                    <table className="table table-sm table-borderless table-py-0 mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Last price</strong></td>
                                <td className="text-end">157.67</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Open</strong></td>
                                <td className="text-end">158.67</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">High</strong></td>
                                <td className="text-end">159.67</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Low</strong></td>
                                <td className="text-end">160.67</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-6">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Change</strong></td>
                                <td className="text-end">4.56</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Change%</strong></td>
                                <td className="text-end">3.89%</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Daily Trading Vol</strong></td>
                                <td className="text-end">1,425,798</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">5-Day Average Trading Vol</strong></td>
                                <td className="text-end">3,283,923</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-3">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">VWAP</strong></td>
                                <td className="text-end">156.38</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Lot Size</strong></td>
                                <td className="text-end">100</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Floor</strong></td>
                                <td className="text-end">162.87</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Ceiling</strong></td>
                                <td className="text-end">151.72</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
)
export default OrderBookTickerDetail;