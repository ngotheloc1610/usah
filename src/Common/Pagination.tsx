import { useEffect } from 'react'
import '../pages/Orders/OrderHistory/orderHistory.scss'
import Pagination from "react-js-pagination";
import { convertNumber } from '../helper/utils';
import { LIST_OPTION_PAGINATION } from '../constants/general.constant';
interface IPropsPagination {
    totalItem: number;
    itemPerPage: number;
    currentPage: number;
    getItemPerPage: (item: number) => void;
    getCurrentPage: (item: number) => void;
}

function PaginationComponent(props: IPropsPagination) {
    const { totalItem, itemPerPage, currentPage, getItemPerPage, getCurrentPage } = props;

    const handleChangePage = (pageNumber: number) => {
        getCurrentPage(pageNumber);
    }

    return (
        <div className="border-top pt-2 d-flex justify-content-between align-items-center mb-3">
            <div className="dataTables_length" id="table_length">
                <label className='special'>
                    Show
                    <select name="table_length" aria-controls="table" className="form-select form-select-sm form-select-inline"
                        value={itemPerPage}
                        onChange={(event) => {
                            getItemPerPage(convertNumber(event.target.value))
                        }}
                    >
                        {
                            LIST_OPTION_PAGINATION.map((item, index) => (
                                <option key={index} value={item.value}>{item.title}</option>
                            ))
                        }
                    </select>
                    entries
                </label>
            </div>

            <div className="dataTables_paginate paging_simple_numbers" id="table_paginate">
                <Pagination
                    activePage={currentPage}
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