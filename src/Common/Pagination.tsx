import '../pages/Orders/OrderHistory/orderHistory.scss'



function Pagination() {    

   
    return (
        <div className="border-top pt-2 d-flex justify-content-between align-items-center">
            <div className="dataTables_length" id="table_length">
                <label className='special'>
                    Show
                    <select name="table_length" aria-controls="table" className="form-select form-select-sm form-select-inline"
                            defaultValue="10" 
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    entries
                </label>
            </div>
            <div className="dataTables_paginate paging_simple_numbers" id="table_paginate">
                <ul className="pagination pagination-sm">
                    <li className="paginate_button page-item previous disabled" id="table_previous">
                        <a href="#" aria-controls="table" data-dt-idx="0" tabIndex={0} className="page-link">Previous</a>
                    </li><li className="paginate_button page-item active">
                        <a href="#" aria-controls="table" data-dt-idx="1" tabIndex={0} className="page-link">1</a>
                    </li>
                    <li className="paginate_button page-item ">
                        <a href="#" aria-controls="table" data-dt-idx="2" tabIndex={0} className="page-link">2</a>
                    </li>
                    <li className="paginate_button page-item ">
                        <a href="#" aria-controls="table" data-dt-idx="3" tabIndex={0} className="page-link">3</a>
                    </li>
                    <li className="paginate_button page-item next" id="table_next">
                        <a href="#" aria-controls="table" data-dt-idx="4" tabIndex={0} className="page-link">Next</a>
                    </li>
                </ul>
            </div>
        </div>
    )
}
export default Pagination