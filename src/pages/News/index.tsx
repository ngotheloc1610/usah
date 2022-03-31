import { DEFAULT_DETAIL_NEWS } from '../../mocks'
import { IReqNews, INews, ITradingResult, IReqTradingResult } from '../../interfaces/news.interface'
import './New.css'
import { useEffect, useState } from 'react'
import { API_GET_NEWS, API_GET_TRADING_RESULT, API_POST_NEWS, API_POST_TRADING_RESULT } from '../../constants/api.constant'
import axios from 'axios';
import { DEFAULT_PAGE_SIZE_FOR_NEWS, ItemsPage, TAB_NEWS } from '../../constants/news.constant'
import { success } from '../../constants';
import { SIDE, START_PAGE } from '../../constants/general.constant'
import parse from "html-react-parser";
import { convertNumber, defindConfigGet, defindConfigPost, formatDate } from '../../helper/utils';
import Pagination from "react-js-pagination";
import moment from 'moment'

interface IParamPagination {
    page_size: number;
    page: number;
}

const News = () => {

    const api_url = process.env.REACT_APP_API_URL;
    const [elActive, setELActive] = useState(0);
    const [elTradingActive, setElTradingActive] = useState(0);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE_FOR_NEWS);
    const [pageSizeTrading, setPageSizeTrading] = useState(DEFAULT_PAGE_SIZE_FOR_NEWS);
    const [pageCurrentTrading, setPageCurrentTrading] = useState(START_PAGE);

    const [listDataNews, setListDataNews] = useState<INews[]>();
    const [listTradingResults, setListTradingResults] = useState<ITradingResult[]>([]);
    const [dataDetailNews, setDataDetailNews] = useState<INews>(DEFAULT_DETAIL_NEWS);
    const [pageCurrent, setPageCurrent] = useState<number>(START_PAGE);
    const [totalNewsUnread, setTotalNewsUnread] = useState<number>(0);
    const [totalUnReadTrading, setTotalUnReadTrading] = useState<number>(0);
    const [isUnread, setIsUnread] = useState<boolean>(false);
    const [isUnreadTradingNotice, setIsUnreadTradingNotice] = useState(false);
    const [listDataUnread, setListDataUnread] = useState<INews[]>();
    const [listDataUnreadTrading, setListDataUnreadTrading] = useState<ITradingResult[]>();
    const [totalItem, setTotalItem] = useState<number>(0);
    const [totalTradingResult, setTotalTradingResult] = useState(0);
    const [totalItemUnRead, setTotalItemUnRead] = useState<number>(0);
    const [totalTradingUnread, setTotalTradingUnread] = useState(0);
    const [isNewsTab, setIsNewsTab] = useState(true);
    const [paramTrading, setParamTrading] = useState<IParamPagination>({page_size: 0, page: 0});

    const urlGetNews = `${api_url}${API_GET_NEWS}`;
    const urlGetTradingResult = `${api_url}${API_GET_TRADING_RESULT}`;
    const urlPostNews = `${api_url}${API_POST_NEWS}`;
    const urlPostTrading = `${api_url}${API_POST_TRADING_RESULT}`;
    const paramNews = {
        page_size: pageSize,
        page: pageCurrent,
    }

    useEffect(() => {
        const paramTrading = {
            page_size: pageSizeTrading,
            page: pageCurrentTrading,
        }
        setParamTrading(paramTrading)
    }, [pageSizeTrading, pageCurrentTrading])

    useEffect(() => {
        getDataNews();
    }, [pageSize, pageCurrent])

    useEffect(() => {
        setElTradingActive(0);
    }, [pageSizeTrading, pageCurrentTrading])


    useEffect(() => {
        setPageSize(DEFAULT_PAGE_SIZE_FOR_NEWS);
        setPageSizeTrading(DEFAULT_PAGE_SIZE_FOR_NEWS);
        setPageCurrent(START_PAGE);
        setPageCurrentTrading(START_PAGE)
    }, [isNewsTab])

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

    const getDataTradingResult = (paramTrading: IParamPagination) => {
        axios.get<IReqTradingResult, IReqTradingResult>(urlGetTradingResult, defindConfigGet(paramTrading)).then((resp) => {
            if (resp.status === success) {
                setListTradingResults(resp?.data?.data?.results);
                setTotalTradingResult(resp?.data?.data?.count);
                const listDataUnReadTrading: ITradingResult[] = resp?.data?.data?.results.filter(item => item.readFlg === false);
                if (listDataUnReadTrading) {
                    setTotalUnReadTrading(listDataUnReadTrading.length);
                    setListDataUnreadTrading(listDataUnReadTrading);
                }
            }
        },
            (error) => {
                console.log("errors");
            });
    }

    const handleShowUnread = (isCheck: boolean) => {
        isNewsTab ? setIsUnread(isCheck) : setIsUnreadTradingNotice(isCheck)
        setDataDetailNews(DEFAULT_DETAIL_NEWS);
        isNewsTab ? setTotalItemUnRead(listDataUnread?.length || 0) : setTotalTradingUnread(listDataUnreadTrading?.length || 0);
    }

    const _renderNewsHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Notications</h6>
        </div>
    )

    const onChangeTab = (tab: string) => {
        tab === TAB_NEWS.trading && getDataTradingResult(paramTrading)
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
                <a className={`nav-link ${!isNewsTab ? 'active' : ''}`} aria-current="page" href="#">
                    Trading Results
                    <span className="badge bg-secondary rounded ml-4">{totalUnReadTrading}</span>
                </a>
            </li>
        </>
    )

    const _renderNewsBodyNavItemRight = () => (
        <li className="nav-item ms-auto d-flex align-items-center">
            <div className="form-check form-switch">
                <input className="form-check-input" checked={isNewsTab ? isUnread : isUnreadTradingNotice} onChange={(e) => handleShowUnread(e.target.checked)} type="checkbox" role="switch" id="onlyunread" />
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

    const handleClick = (itemNews: INews, index: number) => {
        setELActive(index);
        if (itemNews) {
            setDataDetailNews(itemNews);
            if (!itemNews.read_flag) {
                handleNewsReaded(itemNews?.id);
            }
        }

    }

    const handleTradingReaded = (idTrading: number) => {
        const urlPostTradingResult = `${urlPostTrading}/${idTrading}/read-flag`
        axios.post<IReqTradingResult, IReqTradingResult>(urlPostTradingResult, '', defindConfigPost()).then((resp) => {
            if (resp?.data?.meta?.code === success) {
                getDataTradingResult(paramTrading)
            }
        },
            (error) => {
                console.log("errors");
            });
    }

    const handleClickTradingResult = (itemTrading: ITradingResult, index: number) => {
        setElTradingActive(index);
        if (itemTrading) {
            if (!itemTrading.readFlg) {
                handleTradingReaded(itemTrading?.id);
            }
        }
    }

    const _renderNewsNotificationItem = (listDataCurr?: INews[]) => (
        listDataCurr?.map((item: INews, index: number) => (
            <div className={!item.read_flag ? "notification-item unread" : "notification-item"
                && elActive === index ? "notification-item active" : "notification-item"}
                key={index}
                onClick={() => handleClick(item, index)}
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

    const getSideName = (side: number) => {
        return SIDE.find(item => item.code === side)?.title;
    }

    const convertTime = (item: string) => {
        return moment(item).tz('Asia/Singapore').format()
    }

    const _renderTradingResultsItem = (listTradingResults?: ITradingResult[]) => (
        listTradingResults?.map((item: ITradingResult, idx: number) => (
            <div className={!item.readFlg ? "notification-item unread" : "notification-item"
                && elTradingActive === idx ? "notification-item active" : "notification-item"}
                key={idx}
                onClick={() => handleClickTradingResult(item, idx)}
            >
                <div className="item-icon">
                    <i className="bi bi-cash-stack"></i>
                </div>
                <div className="item-content">
                    <h5 className="item-title mb-0">Trading Results Information</h5>
                    <div className="item-summary opacity-75 fix-line-css">
                        {getSideName(Number(item.orderSide))} {item.execVolume} {item.symbolCode} price {item.execPrice.toFixed(2)}
                    </div>
                    <div className="item-summary opacity-75 fix-line-css">
                        {convertTime(item.execTime)}
                    </div>
                </div>
            </div>
        ))
    )

    const handlePage = (value) => {
        setPageCurrent(value);
    }

    const handlePageTrading = (value) => {
        setPageCurrentTrading(value);

        const paramTrading = { page_size: pageSizeTrading, page: value };
        getDataTradingResult(paramTrading);
    }


    const _renderItemsPage = () => (
        ItemsPage.map((item, index) => {
            return <option value={item} key={index}>{item}</option>
        })
    )

    const handleItemsPage = (event) => {
        setPageCurrent(1);
        setPageSize(convertNumber(event.target.value));
    }

    const handleItemsPageTrading = (event) => {
        setPageCurrentTrading(1);
        setPageSizeTrading(convertNumber(event.target.value));

        const paramTrading = { page_size: event.target.value, page: 1 };
        getDataTradingResult(paramTrading);
    }

    const _renderNewsPagination = () => (
        <nav className="d-flex justify-content-between align-items-center border-top pt-3">
            <div className="d-flex align-items-center">
                <select className="form-select form-select-sm mb-0 w-4" onChange={isNewsTab ? handleItemsPage : handleItemsPageTrading}>
                    {_renderItemsPage()}
                </select>
                <div className="ms-3">items/page</div>
            </div>
            {isNewsTab ? <Pagination
                activePage={pageCurrent}
                totalItemsCount={isUnread ? totalItemUnRead : totalItem}
                itemsCountPerPage={pageSize}
                pageRangeDisplayed={DEFAULT_PAGE_SIZE_FOR_NEWS}
                prevPageText={'Previous'}
                nextPageText={'Next'}
                onChange={handlePage}
                innerClass={'pagination pagination-sm'}
                itemClass={'paginate_button page-item'}
                linkClass={'page-link'}
            />
                : <Pagination
                    activePage={pageCurrentTrading}
                    totalItemsCount={isUnreadTradingNotice ? totalTradingUnread : totalTradingResult}
                    itemsCountPerPage={pageSizeTrading}
                    pageRangeDisplayed={DEFAULT_PAGE_SIZE_FOR_NEWS}
                    prevPageText={'Previous'}
                    nextPageText={'Next'}
                    onChange={handlePageTrading}
                    innerClass={'pagination pagination-sm'}
                    itemClass={'paginate_button page-item'}
                    linkClass={'page-link'}
                />
            }
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
                {isUnreadTradingNotice && _renderTradingResultsItem(listDataUnreadTrading)}
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
                {parse(dataDetailNews?.newsContent)}
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