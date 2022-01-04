
import { LIST_DATA_ORDER } from '../../../mocks';
import './ListCompany.css';
const ListOrder = () => {
    const renderDataListCompany = LIST_DATA_ORDER.map((item) => {
        return <tr>
            <td>{item.companyName}</td>
            <td>{item.ticker}</td>
            <td>{item.priviousClose}</td>
            <td>{item.open}</td>
            <td>{item.high}</td>
            <td>{item.low}</td>
            <td style={{color: item.volume < 0 ? 'red' : 'green'}}>{item.lastPrice}</td>
            <td style={{color: item.volume < 0 ? 'red' : 'green'}}>{item.volume}</td>
            <td style={{color: item.volume < 0 ? 'red' : 'green'}}>{item.change}</td>
            <td style={{color: item.volume < 0 ? 'red' : 'green'}}>{item.changePercent}</td>
        </tr>
    })
    return (
        <div className="dataTables_scroll">
            <div className="dataTables_scrollHead" style={{ overflow: "hidden", position: "relative", border: 0, width: "100%" }}>
                <div className="dataTables_scrollHeadInner" style={{ boxSizing: "content-box", width: "763.525px", paddingRight: 17 }}>
                    <table className="table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0, width: "763.525px" }}>
                        <thead>
                            <tr>
                                <th className="sorting_disabled" style={{ width: "199.05px" }}>
                                    <span className="text-ellipsis">Company Name</span>
                                </th>
                                <th className="sorting_disabled"  style={{ width: "36.9125px" }}>Ticker
                                </th>
                                <th className="text-end sorting_disabled"  style={{ width: "89.7125px" }}>
                                    <span className="text-ellipsis">Previous Close</span>
                                </th>
                                <th className="text-end sorting_disabled"  style={{ width: "46.8375px" }}>Open</th>
                                <th className="text-end sorting_disabled"  style={{ width: "46.9px" }}>High</th>
                                <th className="text-end sorting_disabled"  style={{ width: "46.8375px" }}>Low</th>
                                <th className="text-end sorting_disabled"  style={{ width: "58.8px" }}>
                                    <span className="text-ellipsis">Last Price</span>
                                </th>
                                <th className="text-end sorting_disabled"  style={{ width: "47.825px" }}>Volume</th>
                                <th className="text-end sorting_disabled"  style={{ width: "47.825px" }}>Change</th>
                                <th className="text-end sorting_disabled"  style={{ width: "62.825px" }}>
                                    <span className="text-ellipsis">Change %</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderDataListCompany}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default ListOrder;