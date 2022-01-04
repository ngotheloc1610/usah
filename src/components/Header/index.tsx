
import { LOGO_ICON } from '../../assets';
import { ROUTER } from '../../constants/route.constant';
import { Colors } from '../../themes';
import './Header.css'
import { IOrderDropdownModel } from '../../constants/route.interface';
import TabBarItem, { ITabBarItem } from './TabBarItem';

const Header = () => {
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
            <a href="#" className="nav-link dropdown-toggle pl-0" role="button" data-bs-toggle="dropdown" aria-expanded="false">C123466</a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">Sub Menu</a></li>
              <li><a className="dropdown-item" href="#">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )

  const _renderDropDown = (item: ITabBarItem) => (
    <TabBarItem itemDropDown={item.itemDropDown} />
  )

  const _renderTabBar = (item: ITabBarItem) => (
    <TabBarItem itemData={item.itemData} />
  )

  const _renderMenuItems = () => (
    ROUTER.map((item: IOrderDropdownModel) => {
      const propData: ITabBarItem = {}
      if (item.subTab.length > 0) {
        propData.itemDropDown = item;
        return _renderDropDown(propData)
      }
      propData.itemData = item;
      return _renderTabBar(propData)
    })
  )

  const _renderHeaderMain = () => (
    <div className="header-main">
      <div className="container d-flex align-items-end">
        <div className="site-brand">
          <h1 className="site-title mb-0">
            <a href="" className="site-link">
              <img src={LOGO_ICON.default} />
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
