import { useState } from "react";
import { SIDE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime } from "../../../helper/utils";
import { IPropListOrder } from "../../../interfaces/order.interface";
import { LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
import * as tspb from '../../../models/proto/trading_model_pb';
import './ListOrder.css';
const defaultProps: IPropListOrder = {
    listOrder: []
};
const ListOrder = (props: IPropListOrder) => {
    const { listOrder } = props;
    const tradingModelPb: any = tspb;
    const [isShowFullData, setShowFullData] = useState(false);
    function getTickerName(sympleId: string) {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.ticker;
    }
    function getSideName(sideId: number) {
        return SIDE.find(item => item.code === sideId)?.title;
    }
    function btnShowFullData() {
        setShowFullData(!isShowFullData);
    }
    
    function getListDataOrder() {
        return listOrder.map((item, index) => {
            return (
                <tr key={index} className="odd">
                    <td>{getTickerName(item.symbolCode.toString())}</td>
                    <td className="text-center"><span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span></td>
                    <td className="text-center">Limit</td>
                    <td className="text-end">{item.price}</td>
                    <td className="text-end">{item.amount}</td>
                    <td className="text-end">{calcPendingVolume(item.amount, item.filledAmount)}</td>
                    <td className="text-end">{formatOrderTime(item.time)}</td>
                    <td className="text-end">
                        <a className="btn-edit-order mr-10">
                            <i className="bi bi-pencil-fill"></i>
                        </a>
                        <a >
                            <i className="bi bi-x-lg"></i>
                        </a>
                    </td>
                </tr>
            )
        })
    }
    function getListTitleOrder() {
        return (
            <table className="dataTables_scrollBody table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}>
                <thead>
                <tr>
                    <th className="sorting_disabled">
                        <span className="text-ellipsis">Ticker</span>
                    </th>
                    <th className="sorting_disabled text-center">
                        <span className="text-ellipsis">Side</span>
                    </th>
                    <th className="sorting_disabled text-center">
                        <span className="text-ellipsis">Type</span>
                    </th>
                    <th className="text-end sorting_disabled">
                        <span className="text-ellipsis">Price</span>
                    </th>
                    <th className="text-end sorting_disabled">
                        <span className="text-ellipsis">Volume</span>
                    </th>
                    <th className="text-end sorting_disabled">
                        <span className="text-ellipsis">Pending Volume</span>
                    </th>
                    <th className="text-end sorting_disabled">
                        <span className="text-ellipsis">Date</span>
                    </th>
                    <th className="text-end sorting_disabled">&nbsp;
                    </th>
                </tr>
            </thead>
            <tbody>
            {getListDataOrder()}
            </tbody>
            </table>
        );
    }

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0"><i className="bi bi-clipboard"></i> Order List</h6>
                <div><a href="#" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white"><i className={`bi bi-chevron-compact-${isShowFullData ? 'up' : 'down'}`}></i></a></div>
            </div>
            <div className="card-body p-0">
                <div className={`table-responsive ${!isShowFullData ? 'mh-250' : ''}`}>
                    {getListTitleOrder()}
                </div>
            </div>
        </div>
    )
}
ListOrder.defaultProps = defaultProps;
export default ListOrder;