import { useState } from "react"
import { formatCurrency, formatNumber } from "../../helper/utils"
import { ITickerInfo } from "../../interfaces/order.interface"
import { LIST_TICKER_INFOR_MOCK_DATA } from "../../mocks"
import './TickerDashboard.scss'

interface ITickerDashboard {
    handleTickerInfo: (item: ITickerInfo) => void
}

const defaultProps = {
    handleTickerInfo: null
}

const TickerDashboard = (props: ITickerDashboard) => {

    const { handleTickerInfo } = props;

    const onClickTickerInfo = (item: ITickerInfo) => {
        handleTickerInfo(item);
    }

    const headerTable = () => (
        <>
            <th className="text-nowrap  sorting_disabled header-cell w-px-150">
                Ticker Name
            </th>
            <th className="text-left sorting_disabled header-cell w-ss">
                Ticker Code
            </th>
            <th className=" text-end sorting_disabled header-cell w-ss ">
                Prvs Close
            </th>
            <th className="text-end sorting_disabled header-cell w-ss ">
                Open
            </th>
            <th className="text-end sorting_disabled header-cell w-ss ">
                High
            </th>
            <th className="text-end sorting_disabled header-cell w-ss ">
                Low
            </th>
            <th className=" text-end sorting_disabled header-cell w-ss ">
                Last price
            </th>
            <th className="text-end sorting_disabled header-cell w-ss ">
                Volume
            </th>
            <th className="text-end sorting_disabled header-cell w-ss ">
                Change
            </th>
            <th className="text-end sorting_disabled header-cell w-ss ">
                Change%
            </th>
            <th className="w-px-15">
                &nbsp;
            </th>
        </>
    )

    const renderDataListCompany = () => (
        LIST_TICKER_INFOR_MOCK_DATA.map((item: ITickerInfo, index: number) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)}>
                <td className="text-left fw-600 w-px-150">{item.tickerName}</td>
                <td className="text-left fw-600 w-ss">{item.ticker}</td>
                <td className="text-end fw-600 w-ss">{formatCurrency(item.previousClose.replaceAll(',', ''))}</td>
                <td className="text-end fw-600 w-ss">{formatCurrency(item.open.replaceAll(',', ''))}</td>
                <td className="text-end fw-600 w-ss">{formatCurrency(item.high.replaceAll(',', ''))}</td>
                <td className="text-end fw-600 w-ss">{formatCurrency(item.low.replaceAll(',', ''))}</td>
                <td className="text-end fw-600 w-ss"><span className={Number(item.lastPrice) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.lastPrice.replaceAll(',', ''))}</span></td>
                <td className="text-end fw-600 w-ss"><span>{formatNumber(item.volume.replaceAll(',', ''))}</span></td>
                <td className="text-end fw-600 w-ss"><span className={Number(item.change) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.change.replaceAll(',', ''))}</span></td>
                <td className="text-end fw-600 w-ss"><span className={Number(item.changePrecent) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.changePrecent.replaceAll(',', ''))}%</span></td>
            </tr>
        ))
    )

    const _renderTableData = () => (
        <div className="dataTables_scroll">
            <div className="dataTables_scrollHead">
                <div className="dataTables_scrollHeadInner"></div>
            </div>
            <div className="dataTables_scrollBody">
                <table id="table" className="table table-sm table-hover mb-0 dataTable no-footer fixed_headers" >
                    <thead className="thead">
                        {headerTable()}
                    </thead>

                    <tbody className="bt-none fs-14 scroll scroll-tbody">
                        {renderDataListCompany()}
                    </tbody>
                </table>
            </div>
        </div>
    )


    const setTableData = () => (
        <div className="table-responsive bg-white">
            <div id="table_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                <div className="row">
                    <div className="col-sm-12">
                        {_renderTableData()}
                    </div>
                </div>
            </div>
        </div>
    )

    return <div className="border border-2 bg-light">
        {setTableData()}
    </div>
}

TickerDashboard.defaultProps = defaultProps

export default TickerDashboard