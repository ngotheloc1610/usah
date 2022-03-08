import { LIST_NEWS_NAV, DEFAULT_DETAIL_NEWS } from '../../mocks'
import { INewsNav, IReqNews, INews } from '../../interfaces/news.interface'
import './New.css'
import { useEffect, useState } from 'react'
import { get_api_news } from '../../constants/api.constant'
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import { ItemsPage } from '../../constants/news.constant'
import { success } from '../../constants';
import parse from "html-react-parser";
import { defindConfig } from '../../helper/utils'

const News = () => {

    const api_url = process.env.REACT_APP_API_URL;
    const [elActive, setELActive] = useState(2)
    const [pageSize, setPageSize] = useState<number>(5);
    const [listDataNews, setListDataNews] = useState<[INews]>();
    const [totalPage, setTotalPage] = useState<number>(1);
    const [dataDetailNews, setDataDetailNews] = useState<INews>(DEFAULT_DETAIL_NEWS);
    const [pageCurrent, setPageCurrent] = useState<number>(1);
    const [totalNewUnread, setTotalNewUnread] = useState<number>(0);

    useEffect(() => {
        const url = `${api_url}${get_api_news}`;
        const paramNews = {
            page_size: pageSize,
            page: pageCurrent,
        }
        axios.get<IReqNews, IReqNews>(url, defindConfig(paramNews)).then((resp) => {
            if (resp.status === success) {
                setListDataNews(resp.data.data.results);
                setTotalPage(resp.data.data.total_page);
                let dem = 0;
                resp.data.data.results.forEach(item => {
                    if (item.read_flag) {
                        dem++;
                    }
                });
                setTotalNewUnread(dem);
            }
        },
            (error) => {
                console.log("errors");
            });
    }, [pageSize, pageCurrent])

    const _renderNewsHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Notications</h6>
        </div>
    )


    const _renderNewsBodyNavItemLeft = () => (
        <li className="nav-item">
            <a className="nav-link active" aria-current="page" href="#">
                Admin News
                <span className="badge bg-secondary rounded ml-4">{totalNewUnread}</span>
            </a>
        </li>
    )

    const _renderNewsBodyNavItemRight = () => (
        <li className="nav-item ms-auto d-flex align-items-center">
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="onlyunread" />
                <label className="form-check-label" htmlFor="onlyunread">Only show unread notifications</label>
            </div>
        </li>
    )

    const handleClick = (index: number, itemNews: INews) => {
        setELActive(index);
        if (itemNews) {
            setDataDetailNews(itemNews);
        }
    }

    const _renderNewsNotificationItem = () => (
        listDataNews?.map((item: INews, index: number) => (
            <div className={item.read_flag ? "notification-item unread" : "notification-item"
                && elActive === index ? "notification-item active" : "notification-item"}
                key={index}
                onClick={() => handleClick(index, item)}
            >
                <div className="item-icon">
                    <i className="bi bi-bell-fill"></i>
                </div>
                <div className="item-content">
                    <h6 className="item-title mb-0">{item?.title}</h6>
                    <div className="item-summary opacity-75">{parse(item?.content)}</div>
                </div>
            </div>

        ))
    )

    const handlePage = (e, value) => {
        setPageCurrent(value);
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
            <Pagination page={pageCurrent} variant="outlined" onChange={handlePage} shape="rounded" count={totalPage} showFirstButton showLastButton />
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

    const closeDetailNews = () => {
        setDataDetailNews(DEFAULT_DETAIL_NEWS);
    }

    // detail
    const _renderNewsNotificationDetailItem = () => (
        <div className="notification-detail border p-3 shadow-sm" >
            <div className="d-flex mb-2 border-bottom pb-1">
                <div>
                    <h6 className="mb-0">{dataDetailNews?.title}</h6>
                    <div className="small opacity-50"> {dataDetailNews?.publish_date} </div>
                </div>
                <a href="#" className="ms-auto close" onClick={closeDetailNews}><i className="bi bi-x-lg"></i></a>
            </div>
            <div>
                <p> {parse(dataDetailNews?.content)} </p>
            </div>
        </div>
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