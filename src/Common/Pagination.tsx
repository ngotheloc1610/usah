import { useEffect, useState } from 'react'
import { START_PAGE } from '../constants/general.constant';
import '../pages/Orders/OrderHistory/orderHistory.scss'

interface IPropsPagination {
    totalItem: number;
    itemPerPage: number;
    currentPage: number;
    getItemPerPage: (item: number) => void;
    getCurrentPage: (item: number) => void;
}

function Pagination(props: IPropsPagination) {

    const { totalItem, currentPage, itemPerPage, getItemPerPage, getCurrentPage } = props
    const [pageNumbers, setPageNumber] = useState<number[]>([])
    const startPage = START_PAGE;
    const lastPage = Math.ceil(totalItem / itemPerPage)

    useEffect(() => {
        const pageNumbers: number[] = [];
        for (let i = 1; i <= lastPage; i++) {
            pageNumbers.push(i);
        }
        setPageNumber(pageNumbers);
    }, [totalItem, itemPerPage, currentPage])

    const handlePrePage = () => {
        const prePage = currentPage === 1 ? 1 : currentPage - 1;
        getCurrentPage(prePage)
    }

    const handleNextPage = () => {
        const nextPage = currentPage < lastPage ? currentPage + 1 : currentPage;
        getCurrentPage(nextPage)
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
                <ul className="pagination pagination-sm">

                    <li className={`paginate_button page-item previous ${currentPage === startPage && "disabled"}`} id="table_previous" onClick={handlePrePage}>
                        <a href="#" aria-controls="table" tabIndex={0} className="page-link">Previous</a>
                    </li>

                    {pageNumbers.map((crrPage, index) => (
                        <li className={`paginate_button page-item ${currentPage === crrPage ? "active" : ""}`} key={index}
                            onClick={() => getCurrentPage(crrPage)}
                        >
                            <a href="#" aria-controls="table" data-dt-idx="1" tabIndex={0} className="page-link">{crrPage}</a>
                        </li>
                    ))}

                    <li className={`paginate_button page-item next ${currentPage === lastPage && "disabled"}`} id="table_next" onClick={handleNextPage}>
                        <a href="#" aria-controls="table" tabIndex={0} className="page-link">Next</a>
                    </li>
                </ul>
            </div>
        </div>
    )
}
export default Pagination