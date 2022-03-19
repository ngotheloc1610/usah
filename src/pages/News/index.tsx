import { LIST_NEWS_NAV, DEFAULT_DETAIL_NEWS, MOCK_TRADING_RESULTS_NOTICE } from '../../mocks'
import { INewsNav, IReqNews, INews } from '../../interfaces/news.interface'
import './New.css'
import { useEffect, useState } from 'react'
import { API_GET_NEWS, API_POST_NEWS } from '../../constants/api.constant'
import axios from 'axios';
import { ItemsPage, TAB_NEWS } from '../../constants/news.constant'
import { success } from '../../constants';
import parse from "html-react-parser";
import { defindConfigGet, defindConfigPost, formatDate } from '../../helper/utils';
import Pagination from "react-js-pagination";

const News = () => {

    const api_url = process.env.REACT_APP_API_URL;
    const [elActive, setELActive] = useState(2)
    const [pageSize, setPageSize] = useState<number>(5);
    const [listDataNews, setListDataNews] = useState<INews[]>();
    // TODO: due to hardcode, don't haven interface yet
    const [listTradingResults, setListTradingResults] = useState<any[]>(MOCK_TRADING_RESULTS_NOTICE);
    const [dataDetailNews, setDataDetailNews] = useState<INews>(DEFAULT_DETAIL_NEWS);
    const [pageCurrent, setPageCurrent] = useState<number>(1);
    const [totalNewsUnread, setTotalNewsUnread] = useState<number>(0);
    const [totalTradingUnread, setTotalTradingUnread] = useState<number>(0);
    const [isUnread, setIsUnread] = useState<boolean>(false);
    const [isUnreadTradingNotice, setIsUnreadTradingNotice] = useState(false);
    const [listDataUnread, setListDataUnread] = useState<INews[]>();
    const [totalItem, setTotalItem] = useState<number>(0);
    const [totalItemUnRead, setTotalItemUnRead] = useState<number>(0);
    const [isNewsTab, setIsNewsTab] = useState(true);

    const urlGetNews = `${api_url}${API_GET_NEWS}`;
    const urlPostNews = `${api_url}${API_POST_NEWS}`; 
    const paramNews = {
        page_size: pageSize,
        page: pageCurrent,
    }

    useEffect(() => {
        getDataNews();
    }, [pageSize, pageCurrent])

    const getDataNews = () => {
        axios.get<IReqNews, IReqNews>(urlGetNews, defindConfigGet(paramNews)).then((resp) => {
            if (resp.status === success) {
                setListDataNews(resp?.data?.data?.results);
                setTotalItem(resp?.data?.data?.count);
                const listDataUnRead: INews[] = resp?.data?.data?.results.filter(item => item.read_flag === false);
                if (listDataUnRead) {
                    setTotalNewsUnread(listDataUnRead.length);
                    setListDataUnread(listDataUnRead);
                }
            }
        },
            (error) => {
                console.log("errors");
            });
    }

    const handleShowUnread = (isCheck: boolean) => {
        setIsUnread(isCheck);
        setDataDetailNews(DEFAULT_DETAIL_NEWS);
        setTotalItemUnRead(listDataUnread?.length || 0);
    }

    const _renderNewsHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Notications</h6>
        </div>
    )

    const onChangeTab = (tab: string) => {
        setIsNewsTab(tab === TAB_NEWS.news);
    }


    const _renderNewsBodyNavItemLeft = () => (
        <>
            <li className="nav-item" onClick={() => onChangeTab(TAB_NEWS.news)}>
                <a className={`nav-link ${isNewsTab ? 'active' : ''}`} aria-current="page" href="#">
                    Admin News
                    <span className="badge bg-secondary rounded ml-4">{totalNewsUnread}</span>
                </a>
            </li>
            <li className='nav-item' onClick={() => onChangeTab(TAB_NEWS.trading)}>
                <a className={`nav-link ${!isNewsTab ? 'active': ''}`} aria-current="page" href="#">
                    Trading Results
                    <span className="badge bg-secondary rounded ml-4">{totalTradingUnread}</span>
                </a>
            </li>
        </>
    )

    const _renderNewsBodyNavItemRight = () => (
        <li className="nav-item ms-auto d-flex align-items-center">
            <div className="form-check form-switch">
                <input className="form-check-input" checked={isUnread} onChange={(e) => handleShowUnread(e.target.checked)} type="checkbox" role="switch" id="onlyunread" />
                <label className="form-check-label" htmlFor="onlyunread">Only show unread notifications</label>
            </div>
        </li>
    )

    const handleNewsReaded = (idNews: number) => {
        const urlPostNew = `${urlPostNews}/${idNews}/read-flag`
        axios.post<IReqNews, IReqNews>(urlPostNew, '', defindConfigPost()).then((resp) => {
            if (resp?.data?.meta?.code === success) {
                getDataNews();
            }
        },
            (error) => {
                console.log("errors");
            });
    }

    const handleClick = (index: number, itemNews: INews) => {
        setELActive(index);
        if (itemNews) {
            setDataDetailNews(itemNews);
            if (!itemNews.read_flag) {
                handleNewsReaded(itemNews?.id);
            }
        }

    }

    const _renderNewsNotificationItem = (listDataCurr?: INews[]) => (
        listDataCurr?.map((item: INews, index: number) => (
            <div className={!item.read_flag ? "notification-item unread" : "notification-item"
                && elActive === index ? "notification-item active" : "notification-item"}
                key={index}
                onClick={() => handleClick(index, item)}
            >
                <div className="item-icon">
                    <i className="bi bi-bell-fill"></i>
                </div>
                <div className="item-content">
                    <h6 className="item-title mb-0">{item?.newsTitle}</h6>
                    <div className="item-summary opacity-75 fix-line-css">{parse(item?.newsContent)}</div>
                </div>
            </div>

        ))
    )

    const _renderTradingResultsItem = (listTradingResults: any[]) => (
        listTradingResults.map((item: any, idx: number) => (
            <div className={!item.read_flag ? "notification-item unread" : "notification-item"
                && elActive === idx ? "notification-item active" : "notification-item"}
                key={idx}
            >
                <div className="item-icon">
                    <i className="bi bi-cash-stack"></i>
                </div>
                <div className="item-content">
                    <h5 className="item-title mb-0">Trading Results Information</h5>
                    <div className="item-summary opacity-75 fix-line-css">
                        {item.side} {item.volume} {item.symbolCode} price {item.price}
                    </div>
                    <div className="item-summary opacity-75 fix-line-css">
                        {item.time}
                    </div>
                </div>
            </div>
        ))
    )

    const handlePage = (value) => {
        setPageCurrent(value);
    }

    const _renderItemsPage = () => (
        ItemsPage.map((item, index) => {
            return <option value={item} key={index}>{item}</option>
        })
    )

    const handleItemsPage = (event) => {
        setPageCurrent(1);
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
            <Pagination
                    activePage={pageCurrent}
                    totalItemsCount={isUnread ? totalItemUnRead : totalItem}
                    itemsCountPerPage={pageSize}
                    pageRangeDisplayed={5}
                    prevPageText={'Previous'}
                    nextPageText={'Next'}
                    onChange={handlePage}
                    innerClass={'pagination pagination-sm'}
                    itemClass={'paginate_button page-item'}
                    linkClass={'page-link'}
                />
            {/* <Pagination page={pageCurrent} variant="outlined" onChange={handlePage} shape="rounded" count={totalPage} showFirstButton showLastButton /> */}
        </nav>
    )

    const _renderNewsNotificationList = () => (
        <div className="col-md-6">
            <div className="notification-list" >
                {!isUnread && _renderNewsNotificationItem(listDataNews)}
                {isUnread && _renderNewsNotificationItem(listDataUnread)}
            </div>

            {_renderNewsPagination()}
        </div>
    )

    const _renderTradingResultsList = () => (
        <div className='col-md-6'>
            <div className='notification-list'>
                {!isUnreadTradingNotice && _renderTradingResultsItem(listTradingResults)}
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
                    <h6 className="mb-0">{dataDetailNews?.newsTitle}</h6>
                    <div className="small opacity-50"> {formatDate(dataDetailNews?.createDate)} </div>
                </div>
                <a href="#" className="ms-auto close" onClick={closeDetailNews}><i className="bi bi-x-lg"></i></a>
            </div>
            <div>
                <p> {parse(dataDetailNews?.newsContent)} </p>
            </div>
        </div>
    )

    const _renderTradingNotificationDetailItem = () => (
        <div className="notification-detail border p-3 shadow-sm" >
        </div>
    )

    const _renderNotificationDetail = () => (
        <div className="col-md-6">
            {isNewsTab && _renderNewsNotificationDetailItem()}
            {!isNewsTab && _renderTradingNotificationDetailItem()}
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
                    {isNewsTab && <div className="row">
                        {_renderNewsNotificationList()}
                        {_renderNotificationDetail()}
                    </div>}
                    {!isNewsTab && <div className="row">
                        {_renderTradingResultsList()}
                        {_renderNotificationDetail()}
                    </div>}
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