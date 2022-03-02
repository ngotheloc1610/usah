
import { LOGO_ICON } from '../../assets';
import { ROUTER } from '../../constants/route.constant';
import { Colors } from '../../themes';
import './Header.scss'
import { IOrderDropdownModel } from '../../constants/route.interface';
import TabBarItem, { ITabBarItem } from './TabBarItem';
import { useEffect, useState } from 'react';
import queryString from 'query-string';
import ReduxPersist from '../../config/ReduxPersist';
import { IAuthen } from '../../interfaces';
import { ACCOUNT_ID, EXPIRE_TIME, KEY_LOCAL_STORAGE, OBJ_AUTHEN } from '../../constants/general.constant';

import { LOGO } from '../../assets';

const Header = () => {
  const [accountId, setAccountId] = useState('');
  useEffect(() => {
    _renderAccountId()
  }, [])

  const _renderAccountId = () => {
    const accountIdCurrent = localStorage.getItem(ACCOUNT_ID);
    if (accountIdCurrent) {
      setAccountId(accountIdCurrent);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ACCOUNT_ID);
    localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
    localStorage.removeItem(EXPIRE_TIME);
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/login`;
  }

  const handleDisplaySetting = () => {
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/setting`;
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
          <li className="nav-item item-notication"><a href="#" className="nav-link pl-0">
            <i className="bi bi-bell-fill"></i>
            <sup className="count">04</sup></a></li>
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
    ROUTER.map((item: IOrderDropdownModel, index) => {
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
  return <div>{_renderHeaderTemplate()}</div>
};
export default Header;
