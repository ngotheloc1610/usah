import { DEFAULT_DETAIL_NEWS } from '../../mocks'
import { IReqNews, INews } from '../../interfaces/news.interface'
import './New.scss'
import { useEffect, useState } from 'react'
import { API_GET_NEWS, API_GET_TOTAL_UNREAD, API_POST_NEWS } from '../../constants/api.constant'
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
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE_FOR_NEWS);
    const [listDataNews, setListDataNews] = useState<INews[]>();
    const [dataDetailNews, setDataDetailNews] = useState<INews>(DEFAULT_DETAIL_NEWS);
    const [pageCurrent, setPageCurrent] = useState<number>(START_PAGE);
    const [totalNewsUnread, setTotalNewsUnread] = useState<number>(0);
    const [isUnread, setIsUnread] = useState<boolean>(false);
    const [totalItem, setTotalItem] = useState<number>(0);
    const urlGetNews = `${api_url}${API_GET_NEWS}`;
    const urlGetTotalUnread = `${api_url}${API_GET_TOTAL_UNREAD}`;
    const urlPostNews = `${api_url}${API_POST_NEWS}`;  
    const isNewTabUrl = queryString.parse(window.location.search)?.isNewTab;
    const [isNewsTab, setIsNewsTab] = useState(isNewTabUrl ? false : true)
    const [isShowNewsDetail, setIsShowNewsDetail] = useState(false)

    useEffect(() => {
        getDataNews(isUnread)
    }, [pageSize, pageCurrent])

    useEffect(() => {
        getTotalUnread()
    }, [])

    const getTotalUnread = () => {
        axios.get<IReqNews, IReqNews>(urlGetTotalUnread, defindConfigPost()).then((resp) => {
            if (resp.status === success) {
                if(resp?.data?.data) {
                    setTotalNewsUnread(resp?.data?.data?.num_unread_news)
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

    const handleShowUnread = (isCheck: boolean) => {
        setPageCurrent(FIRST_PAGE);
        const param: IParamPagination = getParams(isCheck, FIRST_PAGE);
        getNewsFromServer(param);
        setIsUnread(isCheck);
        setDataDetailNews(DEFAULT_DETAIL_NEWS);
    }

    const _renderNewsHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Notications</h6>
        </div>
    )

    const onChangeTab = (tab: string) => {
        tab === TAB_NEWS.news && getDataNews(isUnread)
        setIsNewsTab(tab === TAB_NEWS.news);
    }


    const _renderNewsBodyNavItemLeft = () => (
        <>
            <li className="nav-item" onClick={() => onChangeTab(TAB_NEWS.news)}>
                <a className={`nav-link ${isNewsTab ? 'active' : ''}`} aria-current="page" href="#">
                    Admin News
                    {totalNewsUnread > 0 && <span className="badge bg-secondary rounded ml-4">{totalNewsUnread}</span>}
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
        setIsShowNewsDetail(true)
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

    const handlePage = (value) => {
        setPageCurrent(value);
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

    const closeDetailNews = () => {
        setDataDetailNews(DEFAULT_DETAIL_NEWS);
        setIsShowNewsDetail(false);
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

    const _renderNotificationDetail = () => (
        <div className="col-md-6">
            {isNewsTab && isShowNewsDetail && _renderNewsNotificationDetailItem()}
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
                        {_renderNotificationDetail()}
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