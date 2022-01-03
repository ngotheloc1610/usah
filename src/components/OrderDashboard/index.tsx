import { ORDER_HEADER_DASHBOARD } from "../../constants/dashboard.constant"
import { IOrderInfomation } from "../../interfaces/order.interface"
import { LIST_DATA_COMPANY } from "../../mocks/general.mock"
import './OrderDashboard.css'

const OrderDashboard = () => {

    const headerTable = () => (
        ORDER_HEADER_DASHBOARD.map((item: string, index: number) => (
            <th className="sorting_disabled header-cell" key={index}>
                {item}
            </th>
        ))
    )

    const renderDataListCompany = () => (
        LIST_DATA_COMPANY.map((item: IOrderInfomation, index: number) => (
            <tr key={index}>
                <td>{item.companyName}</td>
                <td>{item.ticker}</td>
                <td className="text-end">{item.previousClose}</td>
                <td className="text-end">{item.open}</td>
                <td className="text-end">{item.high}</td>
                <td className="text-end">{item.low}</td>
                <td className="text-end"><span className={item.lastPrice >= 0 ? 'text-success' : 'text-danger'}>{item.lastPrice}</span></td>
                <td className="text-end"><span className={item.volume >= 0 ? 'text-success' : 'text-danger'}>{item.volume}</span></td>
                <td className="text-end"><span className={item.change >= 0 ? 'text-success' : 'text-danger'}>{item.change}</span></td>
                <td className="text-end"><span className={item.changePercent >= 0 ? 'text-success' : 'text-danger'}>{item.changePercent}%</span></td>
            </tr>
        ))
    )


    const setTableData = () => (
        <div className="table-responsive bg-white">
            <div id="table_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="dataTables_scroll">
                            <div className="dataTables_scrollHead">
                                <div className="dataTables_scrollHeadInner"></div>
                            </div>
                            <div className="dataTables_scrollBody">
                                <table id="table" className="table table-sm table-hover mb-0 dataTable no-footer" >
                                    <thead>
                                        {headerTable()}
                                    </thead>

                                    <tbody className="bt-none fs-14">
                                        {renderDataListCompany()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return <div className="border border-2 bg-light">
        {setTableData()}
    </div>
}

export default OrderDashboard