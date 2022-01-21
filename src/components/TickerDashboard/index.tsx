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
                Company Name
            </th>
            <th className="text-left sorting_disabled header-cell w-px-80">
                Ticker
            </th>
            <th className="text-nowrap text-end sorting_disabled header-cell w-px-100">
                Previous Close
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Open
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                High
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Low
            </th>
            <th className="text-nowrap text-end sorting_disabled header-cell w-px-80">
                Last price
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Volume
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Change
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
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
                <td className="w-px-150 fw-600">{item.tickerName}</td>
                <td className="text-left w-px-80 fw-600">{item.ticker}</td>
                <td className="text-end w-px-100 fw-600">{formatCurrency(item.previousClose.replace(',', ''))}</td>
                <td className="text-end w-px-80 fw-600">{formatCurrency(item.open.replace(',', ''))}</td>
                <td className="text-end w-px-80 fw-600">{formatCurrency(item.high.replace(',', ''))}</td>
                <td className="text-end w-px-80 fw-600">{formatCurrency(item.low.replace(',', ''))}</td>
                <td className="text-end w-px-80 fw-600"><span className={Number(item.lastPrice) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.lastPrice.replace(',', ''))}</span></td>
                <td className="text-end w-px-80 fw-600"><span className={Number(item.volume) >= 0 ? 'text-success' : 'text-danger'}>{formatNumber(item.volume.replace(',', ''))}</span></td>
                <td className="text-end w-px-80 fw-600"><span className={Number(item.change) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.change.replace(',', ''))}</span></td>
                <td className="text-end w-px-80 fw-600"><span className={Number(item.changePrecent) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.changePrecent.replace(',', ''))}%</span></td>
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
                    <thead>
                        {headerTable()}
                    </thead>

                    <tbody className="bt-none fs-14 scroll-tbody">
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