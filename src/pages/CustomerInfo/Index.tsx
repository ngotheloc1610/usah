import CustomerInfomation from '../../components/CustomerInfo';
import './CustomerInfo.scss';
const CustomerInfo = () => {

    const _renderNav = () => (
        <ul className="nav page-nav flex-column mb-3">
            <li className="nav-item item-customer-infomation">
                <a href="#" className="nav-link active">Customer Infomation</a>
            </li>
            <li className="nav-item item-setting dropdown">
                <a href="customer-infomation.html" className="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Setting</a>
                <ul className="dropdown-menu">
                    <li><a className="dropdown-item item-setting-trading-pin" href="setting-trading-pin.html">Change Trading PIN</a></li>
                    <li><a className="dropdown-item item-setting-password" href="setting-password.html">Change Password</a></li>
                    <li><a className="dropdown-item item-setting-notification" href="setting-notification.html">Notification</a></li>
                </ul>
            </li>
        </ul>
    )

    const _renderContentPage = () => (
        <div className="site-main">
            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        {_renderNav()}
                    </div>
                    <div className="col-md-9">
                        <CustomerInfomation />
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderContentPage()}</>
}

export default CustomerInfo