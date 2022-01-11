import { useState } from "react";
import { INDEX_ALIGN_CENTER, INDEX_ALIGN_RIGHT, TITLE_MODIFY_CANCEL } from "../../../constants/header.constant"
import { LIST_DATA_ORDER } from "../../../mocks";
import Pagination from "../../../pages/Orders/OrderHistory/Pagination";
import ConfirmOrder from "../../Modal/ConfirmOrder";
import "./ListModifyCancel.css"


const defaultData = {
    ticker: '',
    sideName: '',
    typeName: '',
    price: 0,
    volume: 0,
    pending: 0,
    date: ''
}

function styleAlignText(index: number) {
    if (INDEX_ALIGN_RIGHT.indexOf(index) !== -1) {
        return 'text-end';
    }
    if (INDEX_ALIGN_CENTER.indexOf(index) !== -1) {
        return 'text-center';
    }
    return '';
}
const _renderTitleName = () => {
    return TITLE_MODIFY_CANCEL.map((item, index) => (
        <th className={styleAlignText(index)} key={index}>
            <span>{item}</span>
        </th>
    ));
}

const ListModifyCancel = () => {

    const [isModifyCancel, setIsModifyCancel] = useState<boolean>(false);
    const [paramModifyCancel, setParamModifyCancel] = useState(defaultData);

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
                    <button className="btn-edit-order bn-bw" onClick={() => handleModyfyCancel(item)}>
                        <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button className="bn-bw">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </td>
            </tr>
        });
    }
    const togglePopup = (isShowModify: boolean) => {
        setIsModifyCancel(isShowModify);
    }

    function handleModyfyCancel(item: any) {
        setIsModifyCancel(true);
    }

    return <div className="card-modify">
        <div className="card-body p-0 mb-3">
            <div className="table">
                <table className="table table-sm table-hover mb-0 dataTable no-footer">
                    <thead>
                        <tr>
                            {_renderTitleName()}
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