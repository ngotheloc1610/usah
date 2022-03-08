import { useEffect, useState } from 'react'
import { START_PAGE } from '../constants/general.constant';
import '../pages/Orders/OrderHistory/orderHistory.scss'
import Pagination from "react-js-pagination";

interface IPropsPagination {
    totalItem: number;
    itemPerPage: number;
    getItemPerPage: (item: number) => void;
    getCurrentPage: (item: number) => void;
}

function PaginationComponent(props: IPropsPagination) {
    const { totalItem, itemPerPage, getItemPerPage, getCurrentPage } = props
    const [activePage, setActivePage] = useState(START_PAGE)

    const handleChangePage = (pageNumber: number) => {
        setActivePage(pageNumber)
        getCurrentPage(pageNumber)
    }

    return (
        <div className="border-top pt-2 d-flex justify-content-between align-items-center mb-3">
            <div className="dataTables_length" id="table_length">
                <label className='special'>
                    Show
                    <select name="table_length" aria-controls="table" className="form-select form-select-sm form-select-inline"
                        defaultValue="10"
                        onChange={(event) => getItemPerPage(Number(event.target.value))}
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
                <Pagination
                    activePage={activePage}
                    totalItemsCount={totalItem}
                    itemsCountPerPage={itemPerPage}
                    pageRangeDisplayed={5}
                    prevPageText={'Previous'}
                    nextPageText={'Next'}
                    onChange={handleChangePage}
                    innerClass={'pagination pagination-sm'}
                    itemClass={'paginate_button page-item'}
                    linkClass={'page-link'}
                />
            </div>
        </div>
    )
}
export default PaginationComponent