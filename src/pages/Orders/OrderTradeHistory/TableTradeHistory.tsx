import { ORDER_TRADE_HISTORY } from '../../../mocks'
import { IOrderTradeHistory } from '../../../interfaces/order.interface'
import Pagination from '../OrderHistory/Pagination'

function TableTradeHistory(props: any) {
    const {getDataTradeHistory} = props
    const _renderTradeHistoryTableHeader = () =>
    (<tr>
        <th className="text-left fz-14">Order ID</th>
        <th className="text-start fz-14">Ticker Code</th >
        <th className="text-start fz-14" >Ticker Name</th>
        <th className="text-center fz-14" > Order Side </th>
        <th className="text-center fz-14" >Order Type </th>
        <th className="text-end fz-14 "> Order Volume </th>
        <th className="text-end fz-14 " >Order Price  </th>
        <th className="text-end fz-14" > Executed Volume</th>
        <th className="text-end fz-14">Executed Price</th>
        <th className="text-end fz-14"> Matched Value</th>
        <th className="text-end fz-14"> Executed Datetime</th>
    </tr>)


    const _renderTradeHistoryTableBody = () => (
        ORDER_TRADE_HISTORY.map((item: IOrderTradeHistory, index: number) => (
            <tr className="align-middle" key={index}>
                <td><span className="text-ellipsis"><a href="#">{item.oderId}</a></span></td>

                <td>
                    <div className="text-ellipsis text-start">{item.tickerCode}</div>
                </td>
                <td>
                    <div className="text-ellipsis text-start">{item.tickerName}</div>
                </td>
                <td className="text-center">
                    <span className={item.side == 'Sell' ? "text-success" : "text-danger"}>
                        {item.side}
                    </span>
                </td>

                <td className="text-center">{item.orderType}</td>

                <td>
                    <div className="text-ellipsis text-end">{item.orderVolume}</div>
                </td>

                <td>
                    <div className="text-ellipsis text-end">{item.orderPrice}</div>
                </td>

                <td className="text-end" >{item.executedVolume}</td>

                <td>
                    <div className="text-ellipsis text-end">{item.executedPrice}</div>
                </td>

                <td>
                    <div className="text-ellipsis text-end">{item.matchedValue}</div>
                </td>
                <td>
                    <div className="text-ellipsis  text-end">{item.excutedDatetime}</div>
                </td>
            </tr>
        ))
    )


    const _renderTradeHistoryTable = () => {
        return (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderTradeHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderTradeHistoryTableBody()}
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
    return(
        <>
        {_renderTradeHistoryTable()}
        </>
    )
}
export default TableTradeHistory