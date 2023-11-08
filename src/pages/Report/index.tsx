import { REPORT_LIST } from '../../mocks'
import { IReportList } from '../../interfaces/report.interface'
import './Report.scss'

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
                <option value="1">Daily</option>
                <option value="2">Yearly</option>
            </select>
        </div>
    )

    const _renderDateTime = () => (
        <div className="col-xl-5 col-lg-7 col-md-12">
            <div className="row g-2">
                <div className="col-md-6">
                    <label className="d-block text-secondary mb-1">From</label>
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm border-end-0 date-picker"
                            max="9999-12-31"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <label className="d-block text-secondary mb-1">To</label>
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm border-end-0 date-picker"
                            max="9999-12-31"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const _renderReportSearch = () => (
        <div className="card-body bg-gradient-light">
            <div className="row g-2 align-items-end">
                {_renderReportSearchSelect()}
                {_renderDateTime()}
                <div className="col-xl-1 col-lg-2 mb-2 mb-lg-0 mt-3">
                    <a href="#" className="btn btn-sm d-block btn-primary">Search</a>
                </div>
            </div>
        </div>
    )

    const _renderReportBodyTop = () => (
        <tr>
            <th className="sorting_disabled fz-14 w-260">Name</th>
            <th className="text-center sorting_disabled fz-14  w-260">File Type</th>
            <th className="text-end sorting_disabled fz-14 w-200">Report Date</th>
            <th className="text-center sorting_disabled fz-14 w-500">Status</th>
            <th className="sorting_disabled fz-14 w-30">
                &nbsp;
            </th>
        </tr>
    )

    const _renderReportBodyContent = () => (
        REPORT_LIST.map((item: IReportList, index: number) => (
            <tr className="align-middle odd" key={index}>
                <td className="text-start">{item.name}</td>
                <td className="text-center">{item.type}</td>
                <td className="text-end">{item.date}</td>
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
                </div>
                {/* Màn này hiện đang bỏ nên tạm thời k phân trang ở page này */}
                {/* <Pagination /> */}
            </div>
        </div>
    )

    const _renderReportTemplate = () => (
        <div className="site-main">
            <div className="container">
                <div className="card shadow-sm mb-3">
                    {_renderReportHeader()}
                    {_renderReportSearch()}
                    {_renderReportBody()}
                </div>
            </div>
        </div>
    )

    return (
        _renderReportTemplate()
    )
}

export default Report