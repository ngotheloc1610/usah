
import { useEffect, useState } from 'react';
import { LOGO_ICON } from '../../assets';
import { ROUTER } from '../../constants/route.constant';
import { IChildRoute, IRouter } from '../../constants/route.interface';
import './Header.css'

const Header = () => {
  const [activeElement, setActiveElement] = useState('');
  const setHeaderTop = () => (
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

  const getListChildMenu = (data: IChildRoute[]) => (
    data.map((item: IChildRoute, index: number) => (
      <li key={index}><a className="dropdown-item" href={item.link}>{item.name}</a></li>
    ))
  )

  const getMenuItemHasChild = (item: IRouter, index: number) => (
    <li className="nav-item dropdown" key={index}>
      <a className="nav-link dropdown-toggle color-not-active" role="button" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false">
        <i className={item.icon}></i>
        <span className="d-none d-lg-inline-block">{item.name}</span></a>
      <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
        {getListChildMenu(item.children)}
      </ul>
    </li>
  )

  useEffect(() => {
    handleActive();
  }, [])

  const handleActive = () => {
    const currentUrl = window.location.pathname;
    setActiveElement(currentUrl);
  }

  const getMenuItemNoChild = (item: IRouter, index: number) => (
    <li className="nav-item" key={index}>
      <a href={item.link} className={activeElement === item.link ? 'nav-link active' : 'nav-link color-not-active'}>
        <i className={item.icon}></i>
        <span className="d-none d-lg-inline-block">{item.name}</span>
      </a>
    </li>
  )

  const getMenuItems = () => (
    ROUTER.map((item: IRouter, index: number) => {
      if (item.children.length > 0) {
        return getMenuItemHasChild(item, index)
      }
      return getMenuItemNoChild(item, index)
    })
  )

  const setHeaderMain = () => (
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
          {getMenuItems()}
        </ul>
      </div>
    </div>
  )

  const setHeaderTemplate = () => (
    <div className="site-header">
      {setHeaderTop()}
      {setHeaderMain()}
    </div>
  )
  return <div>{setHeaderTemplate()}</div>
};
export default Header;
