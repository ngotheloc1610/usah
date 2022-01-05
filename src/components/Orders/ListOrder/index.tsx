import { useState } from "react";
import { LIST_DATA_ORDER } from "../../../mocks";

const ListOrder = () => {
    const [isShowFullData, setShowFullData] = useState(false);

    function btnShowFullData() {
        setShowFullData(!isShowFullData);
    }
    function getListDataOrder() {
        return LIST_DATA_ORDER.map((item, index) => {
            return (
                <tr key={index} className="odd">
                    <td style={{ width: "222.422px" }}>{item.ticker}</td>
                    <td style={{ width: "89.75px" }}><span className="text-danger">{item.sideName}</span></td>
                    <td style={{ width: "111.703px" }}>{item.typeName}</td>
                    <td style={{ width: "144.625px" }} className="text-end">{item.price}</td>
                    <td style={{ width: "167.562px" }} className="text-end">{item.volume}</td>
                    <td style={{ width: "167.562px" }} className="text-end">{item.pending}</td>
                    <td style={{ width: "412.688px" }} className="text-end">{item.date}</td>
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
                        <span className="text-ellipsis">Ticker name</span>
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
                    <th className="text-end sorting_disabled" style={{ width: "149.488px" }}>
                        <span className="text-ellipsis">Pending</span>
                    </th>
                    <th className="text-end sorting_disabled" style={{ width: "367.4px" }}>
                        <span className="text-ellipsis">Date</span>
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