
import { LOGO_ICON } from '../../assets';
import './Header.css'

const Header = () => {

  const setHeaderTop = () => (
    <div className="header-top">
      <div className="container-fluid d-flex justify-content-end">
        <ul className="nav header-top-nav">
          <li className="nav-item"><a href="#" className="nav-link"><i className="bi bi-arrow-bar-left"></i></a></li>
          <li className="nav-item"><a href="#" className="nav-link"><i className="bi bi-arrows-angle-contract"></i></a></li>
          <li className="nav-item item-menu"><a href="#" className="nav-link"><i className="bi bi-list"></i></a></li>
          <li className="nav-item item-notication"><a href="#" className="nav-link"><i className="bi bi-bell-fill"></i><sup className="count">04</sup></a></li>
          <li className="nav-item dropdown">
            <a href="#" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">C123466</a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">Sub Menu</a></li>
              <li><a className="dropdown-item" href="#">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )

  const setHeaderMain = () => (
    <div className="header-main">
        <div className="container d-flex align-items-end">
          <div className="site-brand">
            <h1 className="site-title mb-0">
              <a href="index.html" className="site-link"><img src={LOGO_ICON} className="site-logo" alt="" /></a>
            </h1>
          </div>
          <ul className="nav header-nav">
            <li className="nav-item item-dashboard"><a href="index.html" className="nav-link active"><i className="icon bi bi-app-indicator me-1"></i><span className="d-none d-lg-inline-block">Dashboard</span></a></li>
            <li className="nav-item item-news"><a href="news.html" className="nav-link"><i className="icon bi bi-card-text me-1"></i><span className="d-none d-lg-inline-block">News</span></a></li>
            <li className="nav-item item-order dropdown">
              <a href="#" className="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="icon bi bi-clipboard me-1"></i><span className="d-none d-lg-inline-block">Order</span></a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item item-order-Monitoring" href="order-monitoring.html">Order Monitoring</a></li>
                <li><a className="dropdown-item item-order-history" href="order-history.html">Order History</a></li>
                <li><a className="dropdown-item item-trade-history" href="trade-history.html">Trade History</a></li>
                <li><a className="dropdown-item item-order-portfolio" href="order-portfolio.html">Portfolio</a></li>
                <li><a className="dropdown-item item-order-new" href="new-order.html">New</a></li>
                <li><a className="dropdown-item item-order-modify-cancel" href="order-modify-cancel.html">Modify - Cancel Order</a></li>
              </ul>
            </li>
            <li className="nav-item item-customer"><a href="#" className="nav-link"><i className="icon bi bi-person-workspace me-1"></i><span className="d-none d-lg-inline-block">Customer Infomation</span></a></li>
            <li className="nav-item item-report"><a href="report.html" className="nav-link"><i className="icon bi bi-clipboard-data me-1"></i><span className="d-none d-lg-inline-block">Report</span></a></li>
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
