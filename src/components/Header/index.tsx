import { Colors } from '../../themes';
import './Header.scss'
import { IOrderDropdownModel } from '../../constants/route.interface';
import TabBarItem, { ITabBarItem } from './TabBarItem';
import { useEffect, useState } from 'react';
import queryString from 'query-string';
import ReduxPersist from '../../config/ReduxPersist';
import { IAuthen } from '../../interfaces';
import { ACCOUNT_ID, EXPIRE_TIME, KEY_LOCAL_STORAGE, PAGE_SIZE, ROLE, ROLE_ACCOUNT_DETAIL, START_PAGE, SUB_ACCOUNTS } from '../../constants/general.constant';

import { LOGO } from '../../assets';
import { ROUTER_MONITORING, ROUTER_TRADER } from '../../constants/route.constant';
import PopUpNotification from '../Modal/PopUpNotification';
import axios from 'axios';
import { IReqTradingResult, ITradingResult } from '../../interfaces/news.interface';
import { API_GET_TOTAL_UNREAD, API_GET_TRADING_RESULT, API_POST_TRADING_RESULT } from '../../constants/api.constant';
import { defindConfigGet, defindConfigPost } from '../../helper/utils';
import { success } from '../../constants';
import { FIRST_PAGE } from '../../constants/news.constant';
import { Link } from 'react-router-dom';

const Header = () => {
  const [accountId, setAccountId] = useState('');
  const roleAccount = localStorage.getItem(ROLE);
  const subAccount = JSON.parse(localStorage.getItem(SUB_ACCOUNTS) || '[]')
  const menus = (roleAccount === ROLE_ACCOUNT_DETAIL.monitor && subAccount.length > 0) ? ROUTER_MONITORING : ROUTER_TRADER;

  const [isShowNotification, setIsShowNotification] = useState(false);

  const pageSizeTrading = PAGE_SIZE;
  const pageCurrentTrading = START_PAGE;

  const [paramTrading, setParamTrading] = useState({ page_size: 5, page: 1 });


  const api_url = process.env.REACT_APP_API_URL;
  const urlGetTradingResult = `${api_url}${API_GET_TRADING_RESULT}`;
  const urlGetTotalUnread = `${api_url}${API_GET_TOTAL_UNREAD}`;
  const urlPostTrading = `${api_url}${API_POST_TRADING_RESULT}`;
  const [totalItemUnread, setTotalItemUnread] = useState(0);


  const [listTradingResults, setListTradingResults] = useState<ITradingResult[]>([]);
  const [showNotificationUnread, setShowNotificationUnread] = useState(false);


  useEffect(() => {
    _renderAccountId()
  }, [])

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
    const paramTrading = !showNotificationUnread ? {
      page_size: pageSizeTrading,
      page: pageCurrentTrading
    } : {
      page_size: pageSizeTrading,
      page: pageCurrentTrading,
      read_flag: false
    }
    getDataTradingResult(paramTrading);
  }, [showNotificationUnread]);


  const _renderAccountId = () => {
    const accountIdCurrent = localStorage.getItem(ACCOUNT_ID);
    if (accountIdCurrent) {
      setAccountId(accountIdCurrent);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ACCOUNT_ID);
    localStorage.removeItem(ROLE);
    localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
    localStorage.removeItem(EXPIRE_TIME);
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/login`;
  }

  const handleDisplaySetting = () => {
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/setting`;
  }

  const showPopupNotification = (e) => {
    e.stopPropagation()
    setIsShowNotification(!isShowNotification);
  }
  // Notification
  const getDataTradingResult = (paramTrading) => {
    axios.get<IReqTradingResult, IReqTradingResult>(urlGetTradingResult, defindConfigGet(paramTrading)).then((resp) => {
      if (resp.status === success) {
        getTotalTradingResultsUnread()
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
            if(resp?.data?.data) {
              setTotalItemUnread(resp?.data?.data?.num_unread_trading_results);
            }
          }
      },
          (error) => {
              console.log(error);
          });
  }

  const handleReaded = (idTrading: number) => {
    const urlPostTradingResult = `${urlPostTrading}/${idTrading}/read-flag`
    axios.post<IReqTradingResult, IReqTradingResult>(urlPostTradingResult, '', defindConfigPost()).then((resp) => {
      if (resp?.data?.meta?.code === success) {
        getDataTradingResult(paramTrading)
      }
    },
      (error) => {
        console.log(error);
      });
  }

  const _renderHeaderTop = () => (
    <div className="header-top">
      <div className="container-fluid d-flex justify-content-end">
        <ul className="nav header-top-nav">
          <li className="nav-item">
            <a href="#" className="nav-link"><i className="bi bi-arrow-bar-left"></i></a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link pl-0"><i className="bi bi-arrows-angle-contract"></i></a>
          </li>
          <li className="nav-item item-menu"><a href="#" className="nav-link pl-0">
            <i className="bi bi-list"></i></a>
          </li>
          <li className="nav-item nav-item-notification dropdown d-none d-sm-block show">
            <a onClick={(e) => showPopupNotification(e)}
              href="#" className="nav-link pl-0" role="button"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i className="bi bi-bell-fill"></i>
              <sup className="count">{totalItemUnread}</sup></a>


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
                showNotificationUnread={showNotificationUnread}
              />

              <div className="text-center small">
                <a href='/news/?isNewTab=false' className="text-secondary">View more</a>
              </div>
            </div>
          </li>
          <li className="nav-item dropdown">
            <a href="#" className="nav-link dropdown-toggle pl-0" role="button" data-bs-toggle="dropdown" aria-expanded="false">{accountId}</a>
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
        <div className="site-brand">
          <h1 className="site-title mb-0">
            <a href="" className="site-link text-decoration-none">
              <img src={LOGO} className="site-logo" alt="" />
            </a>
          </h1>
        </div>
        <ul className="nav header-nav">
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
export default Header;
