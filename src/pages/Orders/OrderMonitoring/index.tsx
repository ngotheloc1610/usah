import "./orderMonitoring.css";
const OrderMonitoring = () => {
    return (
        // <div>OrderMonitoring</div>
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="row align-items-stretch g-2 mb-3">
                        <div className="col-lg-9">
                            <div className="row mb-2">
                                <div className="col-lg-6">
                                    <div className="input-group input-group-sm">
                                        <input type="text" className="form-control form-control-sm border-end-0" value="" placeholder="Add a ticker" />
                                        <button className="btn btn-primary">Add</button>
                                    </div>
                                </div>
                            </div>
                            {/* Begin */}
                            <div className="row row-monitoring g-2">
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 col-md-3 col-xl-2">
                                    <table
                                        cellPadding='{"0"}'
                                        cellSpacing={0}
                                        className="table-item-ticker table table-sm table-hover border mb-1"
                                    >
                                        <thead>
                                            <tr>
                                                <th colSpan={3} className="text-center">
                                                    <div className="position-relative">
                                                        <strong className="px-4">AAPL</strong>
                                                        <a href="#" className="position-absolute me-1" style={{ right: 0 }}>
                                                            <i className="bi bi-x-lg" />
                                                        </a>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-end text-success">2,400 (24)</td>
                                                <td className="text-center">145.54</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">1,500 (12)</td>
                                                <td className="text-center">145.55</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end text-success">900 (05)</td>
                                                <td className="text-center">145.56</td>
                                                <td className="text-end">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.58</td>
                                                <td className="text-end text-danger">2,400 (45)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.59</td>
                                                <td className="text-end text-danger">1,700 (12)</td>
                                            </tr>
                                            <tr>
                                                <td className="text-end">&nbsp;</td>
                                                <td className="text-center">145.60</td>
                                                <td className="text-end text-danger">800 (30)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                        <div className="col-lg-3 d-flex">
                            <div className="me-2 h-100 d-flex align-items-center">
                                <a href="javascript:;" className="btn btn-sm btn-outline-secondary px-1 py-3"><i className="bi bi-chevron-double-right"></i></a>
                            </div>
                            <div className="card flex-grow-1 card-order-form mb-2">
                                <div className="card-header">
                                    <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                </div>
                                <div className="card-body">
                                    <form action="#" className="order-form">
                                        {/* <!-- BEGIN Order Slide --> */}
                                        <div className="order-btn-group d-flex align-items-stretch mb-2">
                                            {/* <!-- BEGIN Button Sell --> */}
                                            <button type="button" className="btn btn-buy text-white flex-grow-1 p-2 text-center selected">
                                                <span className="fs-5 text-uppercase">Buy</span>
                                            </button>
                                            {/* <!-- END Button Sell --> */}
                                            {/* <!-- BEGIN Button Buy --> */}
                                            <button type="button" className="btn btn-sell text-white flex-grow-1 p-2 px-2 text-center">
                                                <span className="fs-5 text-uppercase">Sell</span>
                                            </button>
                                            {/* <!-- BEGIN Button Buy --> */}
                                        </div>
                                        {/* <!-- BEGIN Ticker --> */}
                                        <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                            <label className="text text-secondary">Ticker</label>
                                            <div className="fs-5">AAPL</div>
                                        </div>
                                        {/* <!-- BEGIN Order Price --> */}
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
                                        {/* <!-- END Volume --> */}
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
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="card-title mb-0"><i className="bi bi-clipboard"></i> Order List</h6>
                            <div><a href="#" className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white"><i className="bi bi-chevron-compact-up"></i></a></div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <div id="table-order-list_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                                    <div className="row">
                                        <div className="col-sm-12 col-md-6">
                                        </div>
                                        <div className="col-sm-12 col-md-6">
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="dataTables_scroll">
                                                <div className="dataTables_scrollHead" style={{ overflow: "hidden", position: "relative", border: 0, width: "100%" }}>
                                                    <div className="dataTables_scrollHeadInner"
                                                        style={{ boxSizing: "content-box", width: 1497, paddingRight: 17 }}>
                                                        <table className="table table-sm table-hover mb-0 dataTable no-footer"
                                                            style={{ marginLeft: 0, width: 1497 }}>
                                                            <thead>
                                                                <tr>
                                                                    <th className="sorting_disabled" style={{ width: "222.422px" }}>
                                                                        <span className="text-ellipsis">Ticker name</span>
                                                                    </th>
                                                                    <th className="sorting_disabled"
                                                                        style={{ width: "89.75px" }}>
                                                                        <span className="text-ellipsis">Side</span>
                                                                    </th>
                                                                    <th className="sorting_disabled"
                                                                        style={{ width: "111.703px" }}>
                                                                        <span className="text-ellipsis">Type</span>
                                                                    </th>
                                                                    <th className="text-end sorting_disabled"
                                                                        style={{ width: "144.625px" }}>
                                                                        <span className="text-ellipsis">Price</span>
                                                                    </th>
                                                                    <th className="text-end sorting_disabled"
                                                                        style={{ width: "167.562px" }}><span className="text-ellipsis">Volume</span>
                                                                    </th>
                                                                    <th className="text-end sorting_disabled"
                                                                        style={{ width: "167.562px" }}><span className="text-ellipsis">Pending</span>
                                                                    </th>
                                                                    <th className="text-end sorting_disabled"
                                                                        style={{ width: "412.688px" }}><span className="text-ellipsis">Date</span>
                                                                    </th>
                                                                    <th className="text-end sorting_disabled"
                                                                        style={{ width: "116.688px" }} >&nbsp;</th>
                                                                </tr>
                                                            </thead>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div className="dataTables_scrollBody"
                                                    style={{
                                                        position: "relative",
                                                        overflow: "auto",
                                                        maxHeight: 180,
                                                        width: "100%"
                                                    }}>
                                                    <table id="table-order-list"
                                                        className="table table-sm table-hover mb-0 dataTable no-footer"
                                                        style={{ width: "100%" }}><thead>
                                                            <tr style={{ height: 0 }}><th className="sorting_disabled"
                                                                style={{
                                                                    width: "222.422px",
                                                                    paddingTop: 0,
                                                                    paddingBottom: 0,
                                                                    borderTopWidth: 0,
                                                                    borderBottomWidth: 0,
                                                                    height: 0
                                                                }}>
                                                                <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                    <span className="text-ellipsis">Ticker name</span>
                                                                </div>
                                                            </th>
                                                                <th className="sorting_disabled"
                                                                    style={{
                                                                        width: "89.75px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                        <span className="text-ellipsis">Side</span>
                                                                    </div>
                                                                </th>
                                                                <th className="sorting_disabled"
                                                                    style={{
                                                                        width: "111.703px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                        <span className="text-ellipsis">Type</span>
                                                                    </div>
                                                                </th>
                                                                <th className="text-end sorting_disabled"
                                                                    style={{
                                                                        width: "144.625px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                        <span className="text-ellipsis">Price</span>
                                                                    </div>
                                                                </th>
                                                                <th className="text-end sorting_disabled"
                                                                    style={{
                                                                        width: "167.562px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                        <span className="text-ellipsis">Volume</span>
                                                                    </div>
                                                                </th>
                                                                <th className="text-end sorting_disabled"
                                                                    style={{
                                                                        width: "167.562px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}><div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                        <span className="text-ellipsis">Pending</span>
                                                                    </div>
                                                                </th>
                                                                <th className="text-end sorting_disabled"
                                                                    style={{
                                                                        width: "412.688px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>
                                                                        <span className="text-ellipsis">Date</span>
                                                                    </div>
                                                                </th>
                                                                <th className="text-end sorting_disabled"
                                                                    style={{
                                                                        width: "116.688px",
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        borderTopWidth: 0,
                                                                        borderBottomWidth: 0,
                                                                        height: 0
                                                                    }}>
                                                                    <div className="dataTables_sizing" style={{ height: 0, overflow: "hidden" }}>&nbsp;</div>
                                                                </th></tr>
                                                        </thead>

                                                        <tbody>
                                                            <tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="odd">
                                                                <td>AAPL</td>
                                                                <td><span className="text-danger">Sell</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">145,48</td>
                                                                <td className="text-end">230,000</td>
                                                                <td className="text-end">210,000</td>
                                                                <td className="text-end">Dec 2, 2021 10:01:25</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
                                                            </tr><tr className="even">
                                                                <td>NVDA</td>
                                                                <td><span className="text-success">Buy</span></td>
                                                                <td>Limit</td>
                                                                <td className="text-end">220,05</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">100,200</td>
                                                                <td className="text-end">Dec 2, 2021 10:50:21</td>
                                                                <td className="text-end"><a href="#" className="btn-edit-order"><i className="bi bi-pencil-fill"></i></a> <a href="#"><i className="bi bi-x-lg"></i></a></td>
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
    )
}
export default OrderMonitoring