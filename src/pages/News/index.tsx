import { DEFAULT_DETAIL_NEWS } from '../../mocks'
import { IReqNews, INews, ITradingResult, IReqTradingResult } from '../../interfaces/news.interface'
import './New.scss'
import { useEffect, useState } from 'react'
import { API_GET_NEWS, API_GET_TOTAL_UNREAD, API_GET_TRADING_RESULT, API_POST_NEWS, API_POST_TRADING_RESULT } from '../../constants/api.constant'
import axios from 'axios';
import { DEFAULT_PAGE_SIZE_FOR_NEWS, FIRST_PAGE, ItemsPage, NEWS_STATUS, TAB_NEWS } from '../../constants/news.constant'
import { success } from '../../constants';
import { FORMAT_DATE_NEW_OR_RESULT, FORMAT_DATE_TIME_MILLIS, SIDE, START_PAGE } from '../../constants/general.constant'
import parse from "html-react-parser";
import { convertNumber, defindConfigGet, defindConfigPost } from '../../helper/utils';
import Pagination from "react-js-pagination";
import moment from 'moment';
import queryString from 'query-string';

interface IParamPagination {
    page_size: number;
    page: number;
    read_flag?: boolean;
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
    const [paramTrading, setParamTrading] = useState<IParamPagination>({page_size: 0, page: 0});

    const urlGetNews = `${api_url}${API_GET_NEWS}`;
    const urlGetTotalUnread = `${api_url}${API_GET_TOTAL_UNREAD}`;
    const urlGetTradingResult = `${api_url}${API_GET_TRADING_RESULT}`;
    const urlPostNews = `${api_url}${API_POST_NEWS}`;
    const urlPostTrading = `${api_url}${API_POST_TRADING_RESULT}`;
    
    const isNewTabUrl = queryString.parse(window.location.search)?.isNewTab;
    const [isNewsTab, setIsNewsTab] = useState(isNewTabUrl ? false : true)

    useEffect(() => {
        getDataNews(isUnread)
    }, [pageSize, pageCurrent])

    useEffect(() => {
        getTotalUnread()
    }, [])

    useEffect(() => {
        setElTradingActive(0);
    }, [pageSizeTrading, pageCurrentTrading])

    useEffect(() => {
        const param = getParamsTrading(isUnreadTradingNotice, FIRST_PAGE)
        getDataTradingResult(param);
    }, [isNewTabUrl])

    const getTotalUnread = () => {
        axios.get<IReqNews, IReqNews>(urlGetTotalUnread, defindConfigPost()).then((resp) => {
            if (resp.status === success) {
                if(resp?.data?.data) {
                    setTotalNewsUnread(resp?.data?.data?.num_unread_news)
                    setTotalUnReadTrading(resp?.data?.data?.num_unread_trading_results)
                }
            }
        },
            (error) => {
                console.log(error);
            });
    }

    const getParams = (isUnread: boolean, pageIndex: number) => {
        return isUnread ? {
            page_size: pageSize,
            page: pageIndex,
            read_flag: false // read_flag = false --> news unread
        } : { page_size: pageSize, page: pageIndex }
    }

    const getParamsTrading = (isUnreadTradingNotice: boolean, pageCurrentTrading) => {
        return isUnreadTradingNotice ? {
            page_size: pageSizeTrading,
            page: pageCurrentTrading,
            read_flag: false // read_flag = false --> news unread
        } : { page_size: pageSizeTrading, page: pageCurrentTrading }
    }

    const getNewsFromServer = (param: IParamPagination) => {
        axios.get<IReqNews, IReqNews>(urlGetNews, defindConfigGet(param)).then((resp) => {
            if (resp.status === success) {
                const tmpResults = resp?.data?.data?.results;
                const tmpResultActive = tmpResults?.filter(item => item?.newsStatus === NEWS_STATUS.active);
                setListDataNews(tmpResultActive);
                setTotalItem(resp?.data?.data?.count);
            }
        },
            (error) => {
                console.log(error);
            });
    }

    const getDataNews = (isUnread: boolean) => {
        const param: IParamPagination = getParams(isUnread, pageCurrent)
        getNewsFromServer(param)
    }

    const getDataTradingResult = (paramTrading: IParamPagination) => {
        axios.get<IReqTradingResult, IReqTradingResult>(urlGetTradingResult, defindConfigGet(paramTrading)).then((resp) => {
            if (resp.status === success) {
                setListTradingResults(resp?.data?.data?.results);
                setTotalTradingResult(resp?.data?.data?.count);
            }
        },
            (error) => {
                console.log(error);
            });
    }

    const handleShowUnread = (isCheck: boolean) => {
        setPageCurrent(FIRST_PAGE);
        const param: IParamPagination = getParams(isCheck, FIRST_PAGE);
        isNewsTab ? getNewsFromServer(param) : getDataTradingResult(param)
        isNewsTab ? setIsUnread(isCheck) : setIsUnreadTradingNotice(isCheck)
        setDataDetailNews(DEFAULT_DETAIL_NEWS);
    }

    const _renderNewsHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Notications</h6>
        </div>
    )

    const onChangeTab = (tab: string) => {
        const param = getParamsTrading(isUnreadTradingNotice, FIRST_PAGE)
        tab === TAB_NEWS.trading && getDataTradingResult(param)
        tab === TAB_NEWS.news && getDataNews(isUnread)
        setIsNewsTab(tab === TAB_NEWS.news);
    }


    const _renderNewsBodyNavItemLeft = () => (
        <>
            {isNewsTab ? <li className="nav-item" onClick={() => onChangeTab(TAB_NEWS.news)}>
                <a className={`nav-link ${isNewsTab ? 'active' : ''}`} aria-current="page" href="#">
                    Admin News
                    {totalNewsUnread > 0 && <span className="badge bg-secondary rounded ml-4">{totalNewsUnread}</span>}
                </a>
            </li> :
            <li className='nav-item' onClick={() => onChangeTab(TAB_NEWS.trading)}>
                <a className={`nav-link ${!isNewsTab ? 'active' : ''}`} aria-current="page" href="#">
                    Trading Results
                    <span className="badge bg-secondary rounded ml-4">{totalUnReadTrading}</span>
                </a>
            </li>}
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
                getDataNews(isUnread);
                getTotalUnread();
            }
        },
            (error) => {
                console.log(error);
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
                const paramTrading = getParamsTrading(isUnreadTradingNotice, pageCurrentTrading)
                getDataTradingResult(paramTrading)
                getTotalUnread()
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
        return moment(item).format(FORMAT_DATE_TIME_MILLIS)
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

        const paramTrading = getParamsTrading(isUnreadTradingNotice, value);
        getDataTradingResult(paramTrading);
    }


    const _renderItemsPage = () => (
        ItemsPage.map((item, index) => {
            return <option value={item} key={index}>{item}</option>
        })
    )

    const handleItemsPage = (event) => {
        setPageCurrent(FIRST_PAGE);
        setPageSize(convertNumber(event.target.value));
    }

    const handleItemsPageTrading = (event) => {
        setPageCurrentTrading(FIRST_PAGE);
        setPageSizeTrading(convertNumber(event.target.value));

        const paramTrading = { page_size: event.target.value, page: FIRST_PAGE };
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
                totalItemsCount={totalItem}
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
                    totalItemsCount={totalTradingResult}
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
            <div className="notification-list mh-news" >
                {_renderNewsNotificationItem(listDataNews)}
            </div>

            {_renderNewsPagination()}
        </div>
    )

    const _renderTradingResultsList = () => (
        <div className='col-md-6'>
            <div className='notification-list'>
                {_renderTradingResultsItem(listTradingResults)}
            </div>
            {_renderNewsPagination()}
        </div>
    )

    const closeDetailNews = () => {
        setDataDetailNews(DEFAULT_DETAIL_NEWS);
    }

    // detail
    const _renderNewsNotificationDetailItem = () => (

        <div className="notification-detail border" >
            <div className="d-flex border-bottom pb-1 p-3">
                <div>
                    <h6 className="mb-0">{dataDetailNews?.newsTitle}</h6>
                    <div className="small opacity-50"> {dataDetailNews?.publishDate ? moment(dataDetailNews?.publishDate).format(FORMAT_DATE_NEW_OR_RESULT) : ''} </div>
                </div>
                <a href="#" className="ms-auto close" onClick={closeDetailNews}><i className="bi bi-x-lg"></i></a>
            </div>
            <div className='overflow-auto detail-news p-3'>
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