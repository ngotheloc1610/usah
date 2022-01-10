import { INDEX_ALIGN_CENTER, INDEX_ALIGN_RIGHT, TITLE_MODIFY_CANCEL } from "../../../constants/header.constant"
import { LIST_DATA_ORDER } from "../../../mocks";
import Pagination from "../../../pages/Orders/OrderHistory/Pagination";
import "./ListModifyCancel.css"
function styleAlignText(index: number) {
    if (INDEX_ALIGN_RIGHT.indexOf(index) !== -1) {
        return 'text-end';
    }
    if (INDEX_ALIGN_CENTER.indexOf(index) !== -1) {
        return 'text-center';
    }
    return '';
}
function titleName() {
    return TITLE_MODIFY_CANCEL.map((item, index) => {
        return <th className={styleAlignText(index)} key={index}>
            <span>{item}</span>
        </th>
    });
}
function getListModifyCancelData() {
    return LIST_DATA_ORDER.map((item, index) => {
        return <tr key={index}>
            <td>{item.ticker}</td>
            <td>{item.sideName}</td>
            <td>{item.typeName}</td>
            <td className="text-end">{item.price}</td>
            <td className="text-end">{item.volume}</td>
            <td className="text-end">{item.pending}</td>
            <td className="text-end">{item.pending}</td>
            <td className="text-center">{item.date}</td>
            <td className="text-end">
                <a className="btn-edit-order mr-10">
                    <i className="bi bi-pencil-fill"></i>
                </a>
                <a >
                    <i className="bi bi-x-lg"></i>
                </a>
            </td>
        </tr>
    });
}
const ListModifyCancel = () => {
    return <div className="card-modify">
        <div className="card-body p-0 mb-3">
            <div className="table">
                <table className="table table-sm table-hover mb-0 dataTable no-footer">
                    <thead>
                        <tr>
                            {titleName()}
                        </tr>
                    </thead>
                    <tbody>
                        {getListModifyCancelData()}
                    </tbody>
                </table>
            </div>
        </div>
        <Pagination />
    </div>
}
export default ListModifyCancel;