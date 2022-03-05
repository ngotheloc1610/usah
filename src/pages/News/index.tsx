import { LIST_NEWS_NAV, NOTIFICATION_LIST, NOTIFICATION_DETAIL, DEFAULT_NEWS } from '../../mocks'
import { INewsNav, INotificationList, INotificationDetail, IDataNews, IReqNews, INews } from '../../interfaces/news.interface'
import './New.css'
import { useEffect, useState } from 'react'
import { IParamNews } from '../../interfaces'
import { get_api_news } from '../../constants/api.constant'
import axios from 'axios';
import { toast } from "react-toastify";
import { KEY_LOCAL_STORAGE } from '../../constants/general.constant'
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { ItemsPage } from '../../constants/news.constant'
import { success } from '../../constants'


const News = () => {

    const api_url = process.env.REACT_APP_API_URL;
    const [elActive, setELActive] = useState(2)
    const [pageSize, setPageSize] = useState<number>(5);
    const [nextPage, setNextPage] = useState<number>(2);
    const [prevPage, setPrevPage] = useState<number>(0);
    const [listDataNews, setListDataNews] = useState<[INews]>();
    const [totalPage, setTotalPage] = useState<number>(1);

    useEffect(() => {
        const url = `${api_url}${get_api_news}`;
        const paramNews: IParamNews = {
            page_size: pageSize,
            next_page: nextPage,
            prev_page: prevPage,
        }
        const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN)}` },
            params: paramNews
        }
        axios.get<IReqNews, IReqNews>(url, config).then((resp) => {
            // để check data trả về
            console.log(37, resp);
            if (resp.meta.code === success) {
                setListDataNews(resp.data.results);
            }
        },
            (error) => {
                console.log("errors");
            });
    }, [pageSize, nextPage, prevPage])

    const _renderNewsHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Notications</h6>
        </div>
    )


    const _renderNewsBodyNavItemLeft = () => (
        LIST_NEWS_NAV.map((item: INewsNav, index: number) => (
            <li className="nav-item" key={index}>
                <a className={item.active ? "nav-link active" : "nav-link"} aria-current="page" href="#">
                    {item.title}
                    <span className="badge bg-secondary rounded ml-4">{item.unRead}</span>
                </a>
            </li>
        ))
    )

    const _renderNewsBodyNavItemRight = () => (
        <li className="nav-item ms-auto d-flex align-items-center">
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="onlyunread" />
                <label className="form-check-label" htmlFor="onlyunread">Only show unread notifications</label>
            </div>
        </li>
    )

    const handleClick = (index: number) => {
        setELActive(index)
    }

    const _renderNewsNotificationItem = () => (
        listDataNews?.map((item: INews, index: number) => (
            <div className={item.read_flag ? "notification-item unread" : "notification-item"
                && elActive === index ? "notification-item active" : "notification-item"}
                key={index}
                onClick={() => handleClick(index)}
            >
                <div className="item-icon">
                    <i className="bi bi-bell-fill"></i>
                </div>
                <div className="item-content">
                    <h6 className="item-title mb-0">{item?.title}</h6>
                    <div className="item-summary opacity-75">{item?.content}</div>
                </div>
            </div>

        ))
    )

    const handlePage = (e, value) => {
        const resultNextPage = value + 1;
        const resultPrevPage = value -1;
        setNextPage(resultNextPage);
        setPrevPage(resultPrevPage);
    }

    const _renderItemsPage = () => (
        ItemsPage.map((item, index) => {
            return <option value={item} key={index}>{item}</option>
        })
    )

    const handleItemsPage = (event) => {
        setPageSize(event.target.value);
    }
    const _renderNewsPagination = () => (
        <nav className="d-flex justify-content-between align-items-center border-top pt-3">
            <div className="d-flex align-items-center">
                <select className="form-select form-select-sm mb-0 w-4" onChange={handleItemsPage}>
                    {_renderItemsPage()}
                </select>
                <div className="ms-3">items/page</div>
            </div>
            <Pagination page={nextPage - 1} variant="outlined" onChange={handlePage} shape="rounded" count={3} showFirstButton showLastButton />
        </nav>
    )

    const _renderNewsNotificationList = () => (
        <div className="col-md-6">
            <div className="notification-list" >
                {_renderNewsNotificationItem()}
            </div>

            {_renderNewsPagination()}
        </div>
    )

    const _renderNewsNotificationDetailItem = () => (
        NOTIFICATION_DETAIL.map((item: INotificationDetail, index: number) => (
            <div className="notification-detail border p-3 shadow-sm" key={index}>
                <div className="d-flex mb-2 border-bottom pb-1">
                    <div>
                        {/* Sau này sẽ có api trả về hiện tại đang fake data */}
                        <h6 className="mb-0">POEM<sup>2</sup> News</h6>
                        <div className="small opacity-50"> {item.date} </div>
                    </div>
                    <a href="#" className="ms-auto close"><i className="bi bi-x-lg"></i></a>
                </div>
                <div>
                    <p> {item.content} </p>
                </div>
            </div>
        ))

    )

    const _renderNewsNotificationDetail = () => (
        <div className="col-md-6">
            {_renderNewsNotificationDetailItem()}
        </div>
    )

    const _renderNewsBody = () => (
        <div className="card-body">
            <ul className="nav nav-tabs">
                {_renderNewsBodyNavItemLeft()}
                {_renderNewsBodyNavItemRight()}
            </ul>
            <div className="mb-3">
                <div className="py-3">
                    <div className="row">
                        {_renderNewsNotificationList()}
                        {_renderNewsNotificationDetail()}
                    </div>
                </div>

            </div>
        </div>
    )

    const _renderNewsTemplate = () => (
        <div className="site-main">
            <div className="container">
                <div className="card shadow-sm mb-3">
                    {_renderNewsHeader()}
                    {_renderNewsBody()}
                </div>
            </div>
        </div>
    )

    return (
        _renderNewsTemplate()
    )

}
export default News