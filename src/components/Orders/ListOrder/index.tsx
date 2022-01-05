import { useState } from "react";
import { IPropListOrder, IStateListOrder } from "../../../interfaces/order.interface";
const ListOrder = (props: IPropListOrder, state: IStateListOrder) => {
    const { listOrder } = props;
    const [isShowFullData, setShowFullData] = useState(false);
    const defaultProps: IPropListOrder = {
        listOrder: []
    };
    var tempDate = new Date();
    var date = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear() ;
    const currDate = date;
    function btnShowFullData() {
        setShowFullData(!isShowFullData);
    }
    function getListDataOrder() {
        return listOrder.map((item, index) => {
            return (
                <tr key={index} className="odd">
                    <td style={{ width: "222.422px" }}>{item.symbolCode}</td>
                    <td style={{ width: "89.75px" }}><span className="text-danger">{item.orderType}</span></td>
                    <td style={{ width: "111.703px" }}>Limit</td>
                    <td style={{ width: "144.625px" }} className="text-end">{item.price}</td>
                    <td style={{ width: "167.562px" }} className="text-end">{item.amount}</td>
                    <td style={{ width: "167.562px" }} className="text-end">{item.amount}</td>
                    <td style={{ width: "412.688px" }} className="text-end">
                        <div className="row">
                            <div className="col-4"></div>
                            <div className="col-8 text-center">{currDate}</div>
                        </div>

                    </td>
                    <td style={{ width: "96.688px" }} className="text-end">
                        <a href="#" className="btn-edit-order">
                            <i className="bi bi-pencil-fill"></i>
                        </a>
                        <a href="#">
                            <i className="bi bi-x-lg"></i>
                        </a>
                    </td>
                </tr>
            )
        })
    }
    function getListTitleOrder() {
        return (
            <table className="table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}><thead>
                <tr>
                    <th className="sorting_disabled" style={{ width: "197.325px" }}>
                        <span className="text-ellipsis">Ticker</span>
                    </th>
                    <th className="sorting_disabled" style={{ width: "79.7125px" }}>
                        <span className="text-ellipsis">Side</span>
                    </th>
                    <th className="sorting_disabled" style={{ width: "98.65px" }}>
                        <span className="text-ellipsis">Type</span>
                    </th>
                    <th className="text-end sorting_disabled" style={{ width: "127.55px" }}>
                        <span className="text-ellipsis">Price</span>
                    </th>
                    <th className="text-end sorting_disabled" style={{ width: "149.488px" }}>
                        <span className="text-ellipsis">Volume</span>
                    </th>
                    <th className="text-end sorting_disabled" style={{ width: "169.488px" }}>
                        <span className="text-ellipsis">Pending Volume</span>
                    </th>
                    <th className="text-end sorting_disabled" style={{ width: "277.4px" }}>
                        <div className="row">
                            <div className="col-4"></div>
                            <div className="col-4" style={{ fontSize: "16px" }}>Date</div>
                            <div className="col-4"></div>
                        </div>
                    </th>
                    <th className="text-end sorting_disabled" style={{ width: "103.588px" }}>&nbsp;
                    </th>
                </tr>
            </thead>
            </table>
        );
    }
    function handleScrollData() {
        return (
            <div id="table-order-list_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                <div className="row">
                    <div className="col-sm-12 col-md-6">
                    </div>
                    <div className="col-sm-12 col-md-6">
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="dataTables_scroll">
                            <div className="dataTables_scrollBody"
                                style={{
                                    position: "relative",
                                    overflow: "auto",
                                    maxHeight: 180,
                                    width: "100%"
                                }}>
                                {tableListData}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-5">
                    </div>
                    <div className="col-sm-12 col-md-7">
                    </div>
                </div>
            </div>
        )
    }
    const tableListData = (
        <div>
            <table id="table-order-list"
                className="table table-sm table-hover mb-0 dataTable no-footer"
                style={{ width: "100%" }}>
                <tbody>
                    {getListDataOrder()}
                </tbody>
            </table>
        </div>
    );
    const scrollListData = isShowFullData ? tableListData : handleScrollData()
    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0"><i className="bi bi-clipboard"></i> Order List</h6>
                <div><a href="#" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white"><i className={`bi bi-chevron-compact-${isShowFullData ? 'up' : 'down'}`}></i></a></div>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    {getListTitleOrder()}
                    {scrollListData}
                </div>
            </div>
        </div>
    )
}

export default ListOrder;