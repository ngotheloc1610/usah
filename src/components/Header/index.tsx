import { memo, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import { IOrderDropdownModel } from '../../constants/route.interface';
import { ACCOUNT_ID, DEFAULT_TIME_ZONE, EXPIRE_TIME, KEY_LOCAL_STORAGE, MAX_ORDER_VALUE, MAX_ORDER_VOLUME, MIN_ORDER_VALUE, PAGE_SIZE, POEM_ID, ROLE, ROLE_ACCOUNT_DETAIL, START_PAGE, SUB_ACCOUNTS, TEAM_CODE, TEAM_ID, TEAM_ROLE, TIME_ZONE, USAH } from '../../constants/general.constant';
import { ROUTER_MONITORING, ROUTER_TRADER } from '../../constants/route.constant';
import { success } from '../../constants';
import { API_GET_TOTAL_UNREAD, API_GET_TRADING_RESULT, API_POST_TRADING_RESULT } from '../../constants/api.constant';
import { IReqTradingResult, ITradingResult } from '../../interfaces/news.interface';
import { defindConfigGet, defindConfigPost } from '../../helper/utils';

import { Colors } from '../../themes';
import TabBarItem, { ITabBarItem } from './TabBarItem';
import PopUpNotification from '../Modal/PopUpNotification';

import './Header.scss'

const Header = () => {
  const [accountId, setAccountId] = useState('');
  const [poemId, setPoemId] = useState('');
  const roleAccount = sessionStorage.getItem(ROLE);
  const subAccount = JSON.parse(sessionStorage.getItem(SUB_ACCOUNTS) || '[]')
  const menus = (roleAccount === ROLE_ACCOUNT_DETAIL.monitor && subAccount.length > 0) ? ROUTER_MONITORING : ROUTER_TRADER;

  const [isShowNotification, setIsShowNotification] = useState(false);

  const pageSizeTrading = PAGE_SIZE;
  const pageCurrentTrading = START_PAGE;

  const api_url = window.globalThis.apiUrl;
  const urlGetTradingResult = `${api_url}${API_GET_TRADING_RESULT}`;
  const urlGetTotalUnread = `${api_url}${API_GET_TOTAL_UNREAD}`;
  const urlPostTrading = `${api_url}${API_POST_TRADING_RESULT}`;
  const [totalItemUnread, setTotalItemUnread] = useState(0);


  const [listTradingResults, setListTradingResults] = useState<ITradingResult[]>([]);
  const [showNotificationUnread, setShowNotificationUnread] = useState(true);

  const [timeZone, setTimeZone] = useState(localStorage.getItem(TIME_ZONE) ? localStorage.getItem(TIME_ZONE) : DEFAULT_TIME_ZONE);
  const usTime: any = useRef();
  const zoneTime: any = useRef();
  const isBlocked = useSelector((state: any) => state.auth.tabBlock);

  const { marketName } = useSelector((state: any) => state.orders);

  useEffect(() => {
    _renderAccountId()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => handleUsTime(), 1000);

    return () => clearTimeout(timer);
  }, [timeZone]);

  useEffect(() => {
    const timer = setInterval(() => handleSetTimeZone(), 1000);

    return () => clearTimeout(timer);
  }, [timeZone]);

  useEffect(() => {
    const hideModalNotification = () => {
      setIsShowNotification(false)
    }

    window.addEventListener('click', hideModalNotification)

    return () => {
      window.removeEventListener('click', hideModalNotification)
    }
  }, [])

  useEffect(() => {
    const paramTrading = {
      page_size: pageSizeTrading,
      page: pageCurrentTrading
    }
    getDataTradingResult(paramTrading);
    getTotalTradingResultsUnread();
  }, []);

  const _renderAccountId = () => {
    const poemIdCurrent = sessionStorage.getItem(POEM_ID);
    const accountIdCurrent = sessionStorage.getItem(ACCOUNT_ID);
    if (accountIdCurrent) {
      setAccountId(accountIdCurrent);
    }
    if (poemIdCurrent) {
      setPoemId(poemIdCurrent);
    }
  }

  const handleLogout = () => {
    if (isBlocked) return
    sessionStorage.removeItem(ACCOUNT_ID);
    sessionStorage.removeItem(TEAM_CODE);
    sessionStorage.removeItem(TEAM_ID);
    sessionStorage.removeItem(TEAM_ROLE);
    sessionStorage.removeItem(ROLE);
    sessionStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
    localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
    sessionStorage.removeItem(EXPIRE_TIME);
    sessionStorage.removeItem(POEM_ID);
    localStorage.removeItem(MIN_ORDER_VALUE);
    localStorage.removeItem(MAX_ORDER_VALUE);
    localStorage.removeItem(MAX_ORDER_VOLUME);
    window.location.href = `${process.env.PUBLIC_URL}/login`;

  }

  const handleDisplaySetting = () => {
    window.location.href = `${process.env.PUBLIC_URL}/setting`;
  }

  const showPopupNotification = (e) => {
    e.stopPropagation()
    setIsShowNotification(!isShowNotification);
  }
  // Notification
  const getDataTradingResult = (paramTrading) => {
    axios.get<IReqTradingResult, IReqTradingResult>(urlGetTradingResult, defindConfigGet(paramTrading)).then((resp) => {
      if (resp.status === success) {
        setListTradingResults(resp?.data?.data?.results);
      }
    },
      (error) => {
        console.log(error);
      });
  }

  const getTotalTradingResultsUnread = () => {
    axios.get<IReqTradingResult, IReqTradingResult>(urlGetTotalUnread, defindConfigPost()).then((resp) => {
      if (resp.status === success) {
        if (resp?.data?.data) {
          setTotalItemUnread(resp?.data?.data?.num_unread_trading_results);
        }
      }
    },
      (error) => {
        console.log(error);
      });
  }

  const handleReaded = (idTrading: number) => {
    const urlPostTradingResult = `${urlPostTrading}/${idTrading}/read-flag`;
    const indexIdTradingReaded = listTradingResults.findIndex(item => item.id === idTrading);
    listTradingResults[indexIdTradingReaded].readFlg = true;
    const lstTradingResult = [...listTradingResults];
    setListTradingResults(lstTradingResult);
    axios.post<IReqTradingResult, IReqTradingResult>(urlPostTradingResult, '', defindConfigPost()).then((resp) => {
      if (resp?.data?.meta?.code === success) {
        getTotalTradingResultsUnread();
      }
    },
      (error) => {
        console.log(error);
      });
  }

  const handleUsTime = () => {
    if (usTime.current) {
      usTime.current.innerText = moment.tz(moment(), "America/New_York").format('LTS');
    }
  }

  const handleSetTimeZone = () => {
    let time: string = '';
    timeZone === DEFAULT_TIME_ZONE ? time = moment.tz(moment(), "Asia/Singapore").format('LTS') : time = moment.tz(moment(), "Asia/Tokyo").format('LTS');
    if (zoneTime.current) {
      zoneTime.current.innerText = time;
    }
  }

  const _renderHeaderTop = () => (
    <div className="header-top">
      <div className="container-fluid d-flex justify-content-end">
        <div className="small text-end mr-px-20">
          <div>US <span className="ms-2" ref={usTime}></span></div>
          <div className="d-flex align-items-center justify-content-end">
            <select value={timeZone ? timeZone : ''} className="form-select form-select-sm lh-1 me-2 w-4" onChange={(e) => { setTimeZone(e.target.value); localStorage.setItem(TIME_ZONE, e.target.value) }}>
              <option value="SG" >SG</option>
              <option value="JP">JP</option>
            </select>
            <span ref={zoneTime}></span>
          </div>
        </div>
        <ul className="nav header-top-nav">
          <li className="nav-item nav-item-notification dropdown d-none d-sm-block show w-37px mw-px-50">
            <a onClick={(e) => showPopupNotification(e)}
              href="#" className="nav-link pl-0 d-content" role="button"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i className="bi bi-bell-fill text-theme"></i>
              {totalItemUnread > 0 && showNotificationUnread && <sup className="count">{totalItemUnread}</sup>}
            </a>


            <div onClick={e => e.stopPropagation()} className={`dropdown-menu dropdown-menu-notification dropdown-menu-right notification-box ${isShowNotification ? 'show' : ''}`}
              style={{
                position: "absolute",
                willChange: "transform",
                top: 0,
                left: 0,
                width: 400,
                transform: "translate3d(-360px, 40px, 0px)"
              }}>
              <div _ngcontent-mxu-c3="" className="index-angle"></div>
              <div className="m-3 d-flex justify-content-between">
                <strong>Notification</strong>
                <div>
                  <label>On/Off Notifications: <i onClick={() => setShowNotificationUnread(!showNotificationUnread)} className={showNotificationUnread ? "bi bi-toggle-on" : "bi bi-toggle-off"}></i></label>
                </div>
              </div>
              <PopUpNotification listTradingResults={listTradingResults}
                handleReaded={handleReaded}
                setListTradingResults={setListTradingResults}
              />

            </div>
          </li>
          <li className="nav-item dropdown d-flex">
            <div className="small text-end mr-px-20">
              <div><span title='Account ID' className="ms-2">{accountId}</span></div>
              <div className="d-flex align-items-center justify-content-between">
                <div></div>
                <span>{poemId}</span>
              </div>
            </div>
            <a href="#" className="nav-link dropdown-toggle pl-0 nav-link-header" role="button" data-bs-toggle="dropdown" aria-expanded="false"></a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" onClick={handleDisplaySetting}>Setting</a></li>
              <li><a className="dropdown-item" onClick={handleLogout}>Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )

  const _renderDropDown = (item: ITabBarItem, indexKey: number) => (
    <TabBarItem key={indexKey} itemDropDown={item.itemDropDown} />
  )

  const _renderTabBar = (item: ITabBarItem, indexKey: number) => (
    <TabBarItem key={indexKey} itemData={item.itemData} />
  )

  const _renderMenuItems = () => (
    menus.map((item: IOrderDropdownModel, index) => {
      const propData: ITabBarItem = {};
      const indexKey: number = index;
      if (item.subTab.length > 0) {
        propData.itemDropDown = item;
        return _renderDropDown(propData, indexKey)
      }
      propData.itemData = item;
      return _renderTabBar(propData, indexKey)
    })
  )

  const _renderHeaderMain = () => (
    <div className="header-main">
      <div className="container d-flex align-items-end">
        <div className="site-brand" style={{ marginRight: '1.5rem' }}>
          <h1 className="site-title mb-0 text-center">
            <a href="" className="site-link text-decoration-none">
              <strong style={{ fontSize: '28px', display: 'grid'}} className='fw-bolder'>
                <span>US24</span>
                <span>({marketName === USAH ? "Asian Hours" : marketName})</span>
              </strong>
            </a>
          </h1>
        </div>
        <ul className="nav header-nav mt-px-50">
          {_renderMenuItems()}
        </ul>
      </div>
    </div>
  )

  const _renderHeaderTemplate = () => (
    <div className="site-header" style={{ backgroundColor: Colors.lightBlue }}>
      {_renderHeaderTop()}
      {_renderHeaderMain()}
    </div>
  )
  return <>
    <div>{_renderHeaderTemplate()}</div>
  </>
};
export default memo(Header);
