import { REPORT_LIST } from '../../mocks'
import { IReportList } from '../../interfaces/report.interface'
import './Report.css'
import Pagination from '../Orders/OrderHistory/Pagination'
function Report() {

    const _renderReportHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Customer Statement</h6>
        </div>
    )

    const _renderReportSearchSelect = () => (
        <div className="col-xl-2 col-lg-3">
            <label className="d-block text-secondary mb-1">Type of report</label>
            <select className="form-select form-select-sm">
                <option value="0">All</option>
            </select>
        </div>
    )

    const _renderReportSearchForm = (type: string) => (
        <div className="col-md-6">
            <label className="d-block text-secondary mb-1">{type === 'from' ? 'From' : 'To'}</label>
            <div className="input-group input-group-sm">
                <input type="text" className="form-control border-end-0 date-picker" value="" placeholder="DD/MM/YYYY" />
                <span className="input-group-text bg-white"><i className="bi bi-calendar"></i></span>
            </div>
        </div>
    )

    const _renderReportSearch = () => (
        <div className="card-body bg-gradient-light">
            <div className="row g-2 align-items-end">
                {_renderReportSearchSelect()}
                <div className="col-xl-5 col-lg-7 col-md-9">
                    <div className="row g-2">
                        {_renderReportSearchForm('from')}
                        {_renderReportSearchForm('to')}
                    </div>
                </div>
                <div className="col-xl-1 col-lg-2 mb-2 mb-lg-0">
                    <a href="#" className="btn btn-sm d-block btn-primary">Apply</a>
                </div>
            </div>
        </div>
    )

    const _renderReportBodyTop = () => (
        <tr>
            <th className="sorting_disabled fz-14" rowSpan={1} colSpan={1} style={{ width: 532.281 }}>Name</th>
            <th className="sorting_disabled fz-14" rowSpan={1} colSpan={1} style={{ width: 254.828 }}>Report Date</th>
            <th className="text-center sorting_disabled fz-14" rowSpan={1} colSpan={1} style={{ width: 190.219 }} >File Type</th>
            <th className="text-center sorting_disabled fz-14" rowSpan={1} colSpan={1} style={{ width: 184.547 }} >Status</th>
            <th className="sorting_disabled fz-14" rowSpan={1} colSpan={1} style={{ width: 128.125 }}>
                &nbsp;
            </th>
        </tr>
    )

    const _renderReportBodyContent = () => (
        REPORT_LIST.map((item: IReportList, index: number) => (
            <tr className="align-middle odd">
                <td>{item.name}</td>
                <td>{item.date}</td>
                <td className="text-center"><i className="bi bi-file-pdf-fill text-danger fs-6"></i></td>
                <td className="text-center">{item.status}</td>
                <td className="text-end">
                    <a href="#" className="btn btn-success text-white btn-sm"><i className="bi bi-download"></i></a>
                </td>
            </tr>
        ))
    )

    const _renderReportBody = () => (
        <div className="card-body">
            <div className="table-responsive mb-3">
                <div id="table_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                    <table id="table" className="table table-sm table-hover mb-0 dataTable no-footer" cellSpacing={0} cellPadding={0}>
                        <thead>
                            {_renderReportBodyTop()}
                        </thead>
                        <tbody>
                            {_renderReportBodyContent()}
                        </tbody>
                    </table>


                    <Pagination />
                </div>
            </div>
        </div>
    )

    const _renderReportTemplate = () => (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        {_renderReportHeader()}
                        {_renderReportSearch()}
                        {_renderReportBody()}
                    </div>
                </div>
            </div>
        </div>
    )
    return (
        _renderReportTemplate()
    )
}

export default Report