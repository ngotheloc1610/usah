import { MOCKDATA_TRADE_HISTORY } from '../../../../mocks';
import './OrderBookTradeHistory.css';
const OrderBookTradeHistory = () => {
    const _renderData = () => (
        MOCKDATA_TRADE_HISTORY.map((item, index) => {
            return <tr key={index} className="odd">
                <td>{item.dateTime}</td>
                <td className="text-end">{item.volume}</td>
                <td className="text-end">{item.price}</td>
            </tr>
        })
    )
    return <div className="card card-trade-history">
        <div className="card-header">
            <h6 className="card-title mb-0"><i className="icon bi bi-clock me-1"></i> Trade History</h6>
        </div>
        <div className="card-body p-0">
            <div className="table-responsive">
                <div id="table_trade_history_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="dataTables_scroll">
                                <div className="dataTables_scrollHead"
                                    style={{ overflow: "hidden", position: "relative", border: "0px", width: "100%" }}>
                                    <div className="dataTables_scrollHeadInner"
                                        style={{
                                            position: "relative",
                                            overflow: "auto",
                                            width: "100%",
                                            maxHeight: "449.812px"
                                        }}>
                                        <table width="100%" className="table table-sm table-borderless table-hover mb-0 dataTable no-footer"
                                            style={{ boxSizing: "content-box" }}>
                                            <thead>
                                                <tr>
                                                    <th className="sorting_disabled">Datetime</th>
                                                    <th className="text-end sorting_disabled">Vol</th>
                                                    <th className="text-end sorting_disabled">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {_renderData()}
                                            </tbody>
                                        </table>
                                    </div>
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
}
export default OrderBookTradeHistory;