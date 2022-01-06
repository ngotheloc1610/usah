import {ORDER_HISTORY } from '../../../mocks'
import {IOrderHistory} from '../../../interfaces/order.interface'
import SearchOrderHistory from './SearchOrderHistory'
import Pagination from "./Pagination"
import './custom.css' 
import './orderHistory.css'


const OrderHistory = () => {
    const _renderOrderHistoryTableHeader = () => 
        (
            <tr>
                <th><span className="text-ellipsis center center-sp fz-14">Order ID</span></th>
                <th style={{ width: 200 }}>
                    <div className="text-ellipsis text-center fz-14">Ticker Code</div>
                    <div className="text-ellipsis text-center fz-14">Ticker Name</div>
                </th >
                <th className="text-center center fz-14" style={{ width: 120 }}>Order Side</th>
                <th className="text-center center fz-14" style={{ width: 120 }}> Order Status</th>
                <th className="text-center center fz-14" style={{ width: 120 }}>Order Type</th>
                <th style={{ width: 120 }}>
                    <div className="text-ellipsis text-center fz-14">Order Volume</div>
                    <div className="text-ellipsis text-center fz-14">Remaining Volume</div>
                </th>
                <th className="text-center center cennter-min fz-14" style={{ width: 120 }}> Executed Volume
                </th>
                <th style={{ width: 120 }}>
                    <div className="text-ellipsis text-center fz-14">Order Price</div>
                    <div className="text-ellipsis text-center fz-14">Last Price</div>
                </th>
                <th>
                    <div className="text-ellipsis text-center fz-14">
                        Order Datetime
                    </div>
                    <div className="text-ellipsis text-center fz-14">
                        Executed Datetime
                    </div>
                </th>
            </tr>
        )
    

    const _renderOrderHistoryTableBody = () =>  (
        ORDER_HISTORY.map((item: IOrderHistory, index: number) => (
                <tr className="align-middle" key={index}>
                    <td><span className="text-ellipsis"><a href="#">{item.oderId}</a></span></td>

                    <td>
                        <div className="text-ellipsis text-start">{item.ticker}</div>
                        <div className="text-ellipsis text-start">{item.companyName}</div>
                    </td>
                    <td className="text-center"><span className={item.side == 'Sell' ? "text-success" : "text-danger"}>{item.side}</span></td>

                    <td className={item.orderStatus == 'Working' ? "text-info text-center" : "text-center"}>
                        {item.orderStatus}
                    </td>

                    <td className="text-center">{item.orderType}</td>

                    <td>
                        <div className="text-ellipsis text-end">{item.orderVolume}</div>
                        <div className="text-ellipsis text-end">{item.remainVolume}</div>
                    </td>

                    <td className="text-end">{item.executedVolume}</td>

                    <td>
                        <div className="text-ellipsis text-end">{item.orderPrice}</div>
                        {item.lastPrice && <div className="text-ellipsis text-end">{item.lastPrice}</div>}
                        {item.lastPrice ===''&& <div className="text-ellipsis text-end">&nbsp;</div>}
                    </td>

                    <td>
                        <div className="text-ellipsis  text-center">{item.orderDatetime}</div>
                        {item.excutedDatetime && <div className="text-ellipsis  text-center">{item.excutedDatetime}</div>}
                        {item.excutedDatetime==='' && <div className="text-ellipsis  text-center">&nbsp;</div>}
                    </td>
                </tr>
            ))
        )

        
    const _renderOrderHistoryTable = () => {
        return (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderOrderHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderOrderHistoryTableBody()}
                        </tbody>
                    </table>
                    <Pagination />
                </div>
                <p className="text-end border-top pt-3">
                    <a href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
                </p>
            </div>
        )
    }
    const _renderOrderHistory = () => {
        return (
            <div className='site'>
                <div className="site-main">
                    <div className="container">
                        <div className="card shadow-sm mb-3">
                            <SearchOrderHistory />
                            {_renderOrderHistoryTable()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div>
            {_renderOrderHistory()}
        </div>
    )
}
export default OrderHistory