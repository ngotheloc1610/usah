import OrderBookCommonSearch from '../../../components/Orders/OrderBookCommon/OrderBookCommonSearch';
import './OrderBookCommon.css';
const OrderBookCommon = () => (
    <div className="site-main">
        <div className="container">
            <div className="row g-2 align-items-center">
                <div className="col-md-9">
                    <OrderBookCommonSearch />
                </div>
                <div className="col-md-3">
                    <ul className="idTabs nav align-items-center justify-content-center mb-2">
                        <li><a href="#layout-1" className="btn btn-sm btn-outline-secondary mx-1 selected"><i className="bi bi-file-earmark-spreadsheet"></i></a></li>
                        <li><a href="#layout-2" className="btn btn-sm btn-outline-secondary mx-1"><i className="bi bi-file-spreadsheet"></i></a></li>
                        <li><a href="#layout-3" className="btn btn-sm btn-outline-secondary mx-1"><i className="bi bi-grid-3x2"></i></a></li>
                        <li><a href="#layout-4" className="btn btn-sm btn-outline-secondary mx-1"><i className="bi bi-columns"></i></a></li>
                        <li><a href="#layout-5" className="btn btn-sm btn-outline-secondary mx-1"><i className="bi bi-columns-gap"></i></a></li>
                    </ul>
                </div>
            </div>
            <div className="row align-items-stretch g-2">
                <div className="col-md-9">
                    <div className="equal-target">
                        <div id="layout-1">
                            <div className="row align-items-stretch g-2">
                                <div className="col-md-9">
                                    <div className="order-block table-responsive">
                                        <table className="table table-sm table-hover border">
                                            <thead>
                                                <tr>
                                                    <th className="border-end">
                                                        Total Bids
                                                    </th>
                                                    <th className="border-end">
                                                        Number of Bids
                                                    </th>
                                                    <th className="border-end">
                                                        Bid Price
                                                    </th>
                                                    <th className="border-end">
                                                        Ask Price
                                                    </th>
                                                    <th className="border-end">
                                                        Number of Asks
                                                    </th>
                                                    <th className="border-end">
                                                        Total Asks
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">19</td>
                                                    <td className="text-end border-end border-bottom-0">19</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">157.67</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">157.68</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">23</td>
                                                    <td className="text-end border-end border-bottom-0">23</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">42</td>
                                                    <td className="text-end border-end border-bottom-0">23</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">157.66</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">157.69</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">18</td>
                                                    <td className="text-end border-end border-bottom-0">41</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">74</td>
                                                    <td className="text-end border-end border-bottom-0">32</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">157.65</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">157.70</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">42</td>
                                                    <td className="text-end border-end border-bottom-0">83</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">99</td>
                                                    <td className="text-end border-end border-bottom-0">25</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">157.64</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">157.71</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">37</td>
                                                    <td className="text-end border-end border-bottom-0">120</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">113</td>
                                                    <td className="text-end border-end border-bottom-0">14</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">157.53</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">157.72</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">24</td>
                                                    <td className="text-end border-end border-bottom-0">144</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-danger">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <span className="text-info">&nbsp;</span>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <strong>113</strong>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <strong>UNDER</strong>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <strong>OVER</strong>
                                                    </td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">
                                                        <strong>113</strong>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card card-ticker">
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
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card card-new-order d-flex flex-column h-100">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                        </div>
                                        <div className="card-body flew-grow-1">
                                            <form action="#" className="order-form">
                                                <div className="order-btn-group d-flex align-items-stretch mb-2">
                                                    <button type="button" className="btn btn-buy text-white flex-grow-1 p-2 text-center selected">
                                                        <span className="fs-5 text-uppercase">Buy</span>
                                                    </button>
                                                    <button type="button" className="btn btn-sell text-white flex-grow-1 p-2 px-2 text-center">
                                                        <span className="fs-5 text-uppercase">Sell</span>
                                                    </button>
                                                </div>
                                                <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                                    <label className="text text-secondary">Ticker</label>
                                                    <div className="fs-5">AAPL</div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Price</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="145.58" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Volume</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="5,000" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Min lot</div>
                                                    <div><strong>100</strong></div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Owned Volume</div>
                                                    <div><strong>10,000</strong></div>
                                                </div>
                                                <div className="border-top">
                                                    <a href="#" className="btn btn-placeholder btn-primary d-block fw-bold text-white mb-1">Place</a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="layout-2" style={{ display: "none" }}>
                            <div className="row align-items-stretch g-2">
                                <div className="col-md-9">
                                    <div className="order-block table-responsive">
                                        <table className="table table-sm table-hover border">
                                            <thead>
                                                <tr>
                                                    <th className="border-end">Total Asks</th>
                                                    <th className="border-end">Number of Asks</th>
                                                    <th className="border-end" >Ask Price</th>
                                                    <th className="border-end" >Bid Price</th>
                                                    <th className="border-end">Number of Bids</th>
                                                    <th className="border-end">Total Bids</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">23</td>
                                                    <td className="text-end border-end border-bottom-0">23</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">157.68</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">157.67</span></td>
                                                    <td className="text-end border-end border-bottom-0">19</td>
                                                    <td className="text-end border-end border-bottom-0">19</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">41</td>
                                                    <td className="text-end border-end border-bottom-0">18</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">157.69</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">157.66</span></td>
                                                    <td className="text-end border-end border-bottom-0">23</td>
                                                    <td className="text-end border-end border-bottom-0">42</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">83</td>
                                                    <td className="text-end border-end border-bottom-0">42</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">157.70</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">157.65</span></td>
                                                    <td className="text-end border-end border-bottom-0">32</td>
                                                    <td className="text-end border-end border-bottom-0">74</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">120</td>
                                                    <td className="text-end border-end border-bottom-0">37</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">157.71</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">157.64</span></td>
                                                    <td className="text-end border-end border-bottom-0">25</td>
                                                    <td className="text-end border-end border-bottom-0">99</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">144</td>
                                                    <td className="text-end border-end border-bottom-0">24</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">157.72</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">157.53</span></td>
                                                    <td className="text-end border-end border-bottom-0">14</td>
                                                    <td className="text-end border-end border-bottom-0">113</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-info">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0"><span className="text-danger">&nbsp;</span></td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end border-end border-bottom-0"><strong>113</strong></td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0"><strong>UNDER</strong></td>
                                                    <td className="text-end border-end border-bottom-0"><strong>OVER</strong></td>
                                                    <td className="text-end border-end border-bottom-0">&nbsp;</td>
                                                    <td className="text-end border-end border-bottom-0"><strong>113</strong></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card card-ticker">
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
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card card-new-order d-flex flex-column h-100">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                        </div>
                                        <div className="card-body flew-grow-1">
                                            <form action="#" className="order-form">

                                                <div className="order-btn-group d-flex align-items-stretch mb-2">

                                                    <button type="button" className="btn btn-buy text-white flex-grow-1 p-2 text-center selected">
                                                        <span className="fs-5 text-uppercase">Buy</span>
                                                    </button>

                                                    <button type="button" className="btn btn-sell text-white flex-grow-1 p-2 px-2 text-center">
                                                        <span className="fs-5 text-uppercase">Sell</span>
                                                    </button>
                                                </div>
                                                <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                                    <label className="text text-secondary">Ticker</label>
                                                    <div className="fs-5">AAPL</div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Price</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="145.58" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Volume</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="5,000" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Min lot</div>
                                                    <div><strong>100</strong></div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Owned Volume</div>
                                                    <div><strong>10,000</strong></div>
                                                </div>
                                                <div className="border-top">
                                                    <a href="#" className="btn btn-placeholder btn-primary d-block fw-bold text-white mb-1">Place</a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="layout-3" style={{ display: "none" }}>
                            <div className="row align-items-stretch g-2">
                                <div className="col-md-9">
                                    <div className="order-block table-responsive">
                                        <table className="table table-sm border table-borderless table-hover mb-0" >
                                            <thead>
                                                <tr>
                                                    <th className="text-end">Total Ask</th>
                                                    <th className="text-end">Number of Asks</th>
                                                    <th className="text-end">Ask Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-end"><strong>144</strong></td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">OVER</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">144</td>
                                                    <td className="text-end">24</td>
                                                    <td className="text-end"><span className="text-info">157.72</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">120</td>
                                                    <td className="text-end">37</td>
                                                    <td className="text-end"><span className="text-info">157.71</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">83</td>
                                                    <td className="text-end">42</td>
                                                    <td className="text-end"><span className="text-info">157.70</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">41</td>
                                                    <td className="text-end">18</td>
                                                    <td className="text-end"><span className="text-info">157.69</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">23</td>
                                                    <td className="text-end">23</td>
                                                    <td className="text-end"><span className="text-info">157.68</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end"><span className="text-info">&nbsp;</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">23</td>
                                                    <td className="text-end">23</td>
                                                    <td className="text-end"><span className="text-info">&nbsp;</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table className="table table-sm border table-borderless table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="text-end">Total Bids</th>
                                                    <th className="text-end">Number of Bids</th>
                                                    <th className="text-end">Bid Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-end"><strong>19</strong></td>
                                                    <td className="text-end">19</td>
                                                    <td className="text-end">157.67</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">42</td>
                                                    <td className="text-end">23</td>
                                                    <td className="text-end"><span className="text-info">157.66</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">74</td>
                                                    <td className="text-end">32</td>
                                                    <td className="text-end"><span className="text-info">157.65
                                                    </span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">99</td>
                                                    <td className="text-end">25</td>
                                                    <td className="text-end"><span className="text-info">157.64</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">113</td>
                                                    <td className="text-end">14</td>
                                                    <td className="text-end"><span className="text-info">157.63</span></td>
                                                </tr>

                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end"><span className="text-info">&nbsp;</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">113</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">UNDER</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card card-ticker">
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
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card card-new-order d-flex flex-column h-100">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                        </div>
                                        <div className="card-body flew-grow-1">
                                            <form action="#" className="order-form">

                                                <div className="order-btn-group d-flex align-items-stretch mb-2">

                                                    <button type="button" className="btn btn-buy text-white flex-grow-1 p-2 text-center selected">
                                                        <span className="fs-5 text-uppercase">Buy</span>
                                                    </button>


                                                    <button type="button" className="btn btn-sell text-white flex-grow-1 p-2 px-2 text-center">
                                                        <span className="fs-5 text-uppercase">Sell</span>
                                                    </button>

                                                </div>
                                                <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                                    <label className="text text-secondary">Ticker</label>
                                                    <div className="fs-5">AAPL</div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Price</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1"
                                                            value="145.58" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Volume</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1"
                                                            value="5,000" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Min lot</div>
                                                    <div><strong>100</strong></div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Owned Volume</div>
                                                    <div><strong>10,000</strong></div>
                                                </div>
                                                <div className="border-top">
                                                    <a href="#" className="btn btn-placeholder btn-primary d-block fw-bold text-white mb-1">Place</a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="layout-4" style={{ display: "none" }}>
                            <div className="row align-items-stretch g-2">
                                <div className="col-md-9">
                                    <div className="order-block table-responsive">
                                        <table className="table table-sm table-borderless table-hover border  mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="text-end" >Total Bids</th>
                                                    <th className="text-end" >Number of Bids</th>
                                                    <th className="text-end" >Price</th>
                                                    <th className="text-end" >Number of Asks</th>
                                                    <th className="text-end" >Total Asks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">OVER</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">144</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.72</td>
                                                    <td className="text-end">24</td>
                                                    <td className="text-end">144</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.71</td>
                                                    <td className="text-end">37</td>
                                                    <td className="text-end">120</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.70</td>
                                                    <td className="text-end">42</td>
                                                    <td className="text-end">83</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.69</td>
                                                    <td className="text-end">18</td>
                                                    <td className="text-end">41</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end bg-danger-light">157.68</td>
                                                    <td className="text-end">23 </td>
                                                    <td className="text-end">23</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">19</td>
                                                    <td className="text-end">19</td>
                                                    <td className="text-end">157.67</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">42</td>
                                                    <td className="text-end">23</td>
                                                    <td className="text-end">157.66</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">74</td>
                                                    <td className="text-end">32</td>
                                                    <td className="text-end">157.65</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">99 </td>
                                                    <td className="text-end">25</td>
                                                    <td className="text-end">157.64</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">113</td>
                                                    <td className="text-end">14</td>
                                                    <td className="text-end">157.63</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end"><strong>113</strong></td>
                                                    <td className="text-end">&nbsp; </td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">UNDER</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card card-ticker">
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
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card card-new-order d-flex flex-column h-100">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                        </div>
                                        <div className="card-body flew-grow-1">
                                            <form action="#" className="order-form">

                                                <div className="order-btn-group d-flex align-items-stretch mb-2">

                                                    <button type="button" className="btn btn-buy text-white flex-grow-1 p-2 text-center selected">
                                                        <span className="fs-5 text-uppercase">Buy</span>
                                                    </button>


                                                    <button type="button" className="btn btn-sell text-white flex-grow-1 p-2 px-2 text-center">
                                                        <span className="fs-5 text-uppercase">Sell</span>
                                                    </button>

                                                </div>
                                                <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                                    <label className="text text-secondary">Ticker</label>
                                                    <div className="fs-5">AAPL</div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Price</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1"
                                                            value="145.58" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Volume</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1"
                                                            value="5,000" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Min lot</div>
                                                    <div><strong>100</strong></div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Owned Volume</div>
                                                    <div><strong>10,000</strong></div>
                                                </div>
                                                <div className="border-top">
                                                    <a href="#" className="btn btn-placeholder btn-primary d-block fw-bold text-white mb-1">Place</a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="layout-5" style={{ display: "none" }}>
                            <div className="row align-items-stretch g-2">
                                <div className="col-md-9">
                                    <div className="order-block table-responsive">
                                        <table className="table table-sm table-borderless table-hover border mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="text-end" >Total Bids</th>
                                                    <th className="text-end" >Number of Bids</th>
                                                    <th className="text-end" >Price</th>
                                                    <th className="text-end" >Number of Asks</th>
                                                    <th className="text-end" >Total Asks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">OVER</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">144</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.72</td>
                                                    <td className="text-end">24</td>
                                                    <td className="text-end">144</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.71</td>
                                                    <td className="text-end">37</td>
                                                    <td className="text-end">120</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.70</td>
                                                    <td className="text-end">42</td>
                                                    <td className="text-end">83</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">157.69</td>
                                                    <td className="text-end">18</td>
                                                    <td className="text-end">41</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end bg-success-light">157.68</td>
                                                    <td className="text-end">23 </td>
                                                    <td className="text-end">23</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">19</td>
                                                    <td className="text-end">19</td>
                                                    <td className="text-end">157.67</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">42</td>
                                                    <td className="text-end">23</td>
                                                    <td className="text-end">157.66</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">74</td>
                                                    <td className="text-end">32</td>
                                                    <td className="text-end">157.65</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">99 </td>
                                                    <td className="text-end">25</td>
                                                    <td className="text-end">157.64</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">113</td>
                                                    <td className="text-end">14</td>
                                                    <td className="text-end">157.63</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end"><strong>113</strong></td>
                                                    <td className="text-end">&nbsp; </td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">UNDER</td>
                                                    <td className="text-end">&nbsp;</td>
                                                    <td className="text-end">&nbsp;</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card card-new-order d-flex flex-column h-100">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                        </div>
                                        <div className="card-body flew-grow-1">
                                            <form action="#" className="order-form">

                                                <div className="order-btn-group d-flex align-items-stretch mb-2">

                                                    <button type="button" className="btn btn-buy text-white flex-grow-1 p-2 text-center selected">
                                                        <span className="fs-5 text-uppercase">Buy</span>
                                                    </button>


                                                    <button type="button" className="btn btn-sell text-white flex-grow-1 p-2 px-2 text-center">
                                                        <span className="fs-5 text-uppercase">Sell</span>
                                                    </button>

                                                </div>
                                                <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                                    <label className="text text-secondary">Ticker</label>
                                                    <div className="fs-5">AAPL</div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Price</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="145.58" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Volume</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value="5,000" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Min lot</div>
                                                    <div><strong>100</strong></div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Owned Volume</div>
                                                    <div><strong>10,000</strong></div>
                                                </div>
                                                <div className="border-top">
                                                    <a href="#" className="btn btn-placeholder btn-primary d-block fw-bold text-white mb-1">Place</a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card card-ticker">
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
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card card-trade-history">
                        <div className="card-header">
                            <h6 className="card-title mb-0"><i className="icon bi bi-clock me-1"></i> Trade History</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <div id="table_trade_history_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                                    <div className="row">
                                        <div className="col-sm-12 col-md-6">
                                        </div>
                                        <div className="col-sm-12 col-md-6">
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="dataTables_scroll">
                                                <div className="dataTables_scrollHead"
                                                    style={{ overflow: "hidden", position: "relative", border: "0px", width: "100%" }}>
                                                    <div className="dataTables_scrollHeadInner"
                                                        style={{ boxSizing: "content-box", width: 354, paddingRight: 17 }}>
                                                        <table width="100%" className="table table-sm table-borderless table-hover mb-0 dataTable no-footer"
                                                            style={{ boxSizing: "content-box", width: 354, paddingRight: 17 }}>
                                                            <thead>
                                                                <tr>
                                                                    <th className="sorting_disabled" style={{ width: "132.594px" }}>Datetime</th>
                                                                    <th className="text-end sorting_disabled" style={{ width: "89.7188px" }}>Vol</th>
                                                                    <th className="text-end sorting_disabled" style={{ width: "107.688px" }}>Price</th>
                                                                </tr>
                                                            </thead>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div className="dataTables_scrollBody"
                                                    style={{
                                                        position: "relative",
                                                        overflow: "auto",
                                                        width: "100%",
                                                        maxHeight: "449.812px"
                                                    }}>
                                                    <table id="table_trade_history" width="100%"
                                                        className="table table-sm table-borderless table-hover 
                                         mb-0 dataTable no-footer" style={{ width: "100%" }}>
                                                        <thead>
                                                            <tr style={{ height: "0" }}>
                                                                <th className="sorting_disabled"
                                                                    style={{
                                                                        width: "132.594px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                        Datetime
                                                                    </div>
                                                                </th>
                                                                <th className="text-end sorting_disabled"
                                                                    style={{
                                                                        width: "89.7188px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing"
                                                                        style={{ height: 0, overflow: "hidden" }}>Vol
                                                                    </div>
                                                                </th>
                                                                <th className="text-end sorting_disabled"
                                                                    style={{
                                                                        width: "107.688px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing"
                                                                        style={{ height: 0, overflow: "hidden" }}>
                                                                        Price
                                                                    </div>
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            <tr className="odd">
                                                                <td>10:26:30</td>
                                                                <td className="text-end">1,200</td>
                                                                <td className="text-end">157.54</td>
                                                            </tr><tr className="even">
                                                                <td>11:25:19</td>
                                                                <td className="text-end">900</td>
                                                                <td className="text-end">157.50</td>
                                                            </tr><tr className="odd">
                                                                <td>12:25:16</td>
                                                                <td className="text-end">3,800</td>
                                                                <td className="text-end">157.49</td>
                                                            </tr><tr className="even">
                                                                <td>13:24:32</td>
                                                                <td className="text-end">500</td>
                                                                <td className="text-end">157.34</td>
                                                            </tr><tr className="odd">
                                                                <td>14:24:32
                                                                </td>
                                                                <td className="text-end">1,700</td>
                                                                <td className="text-end">157.54</td>
                                                            </tr><tr className="even">
                                                                <td>14:24:31
                                                                </td>
                                                                <td className="text-end">500</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:24:29
                                                                </td>
                                                                <td className="text-end">400</td>
                                                                <td className="text-end">157.62</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:12
                                                                </td>
                                                                <td className="text-end">1,200</td>
                                                                <td className="text-end">157.76</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09
                                                                </td>
                                                                <td className="text-end">3,000</td>
                                                                <td className="text-end">157.65</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09
                                                                </td>
                                                                <td className="text-end">3,000</td>
                                                                <td className="text-end">157.65</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09
                                                                </td>
                                                                <td className="text-end">3,000</td>
                                                                <td className="text-end">157.62</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">3,000</td>
                                                                <td className="text-end">157.65</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="even">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr><tr className="odd">
                                                                <td>14:23:09</td>
                                                                <td className="text-end">6,000</td>
                                                                <td className="text-end">157.63</td>
                                                            </tr></tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12 col-md-5">
                                        </div>
                                        <div className="col-sm-12 col-md-7">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
export default OrderBookCommon;