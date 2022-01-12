import { useState } from 'react';
import CustomerInfomation from '../../components/CustomerInfo';
import Setting from '../../components/Setting/Setting';
import './CustomerInfo.scss';
const CustomerInfo = () => {

    const [isSetting, setIsSetting] = useState(false)
    const [isTradingPin, setIsTradingPin] = useState(false)
    const [isChangePassword, setIsChangePassword] = useState(false)
    const [isNotification, setIsNotification] = useState(false)

    const handleDisplayChangeTradingPin = () => {
        setIsSetting(true);
        setIsTradingPin(true);
        setIsChangePassword(false);
        setIsNotification(false);
    }

    const handleDisplayChangePassword = () => {
        setIsSetting(true);
        setIsTradingPin(false);
        setIsNotification(false);
        setIsChangePassword(true);
    }

    const handleDisplayNotification = () => {
        setIsSetting(true);
        setIsTradingPin(false);
        setIsNotification(true);
        setIsChangePassword(false);
    }

    const handleCustomerInfo = () => {
        setIsSetting(false);
    }

    const _renderNavNomal = () => (
        <ul className="nav page-nav flex-column mb-3">
            <li className="nav-item item-customer-infomation">
                <a href="#" className="nav-link active">Customer Infomation</a>
            </li>
            <li className="nav-item item-setting dropdown">
                <a href="customer-infomation.html" className="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Setting</a>
                <ul className="dropdown-menu">
                    <li><a className="dropdown-item item-setting-trading-pin" onClick={handleDisplayChangeTradingPin}>Change Trading PIN</a></li>
                    <li><a className="dropdown-item item-setting-password" onClick={handleDisplayChangePassword}>Change Password</a></li>
                    <li><a className="dropdown-item item-setting-notification" onClick={handleDisplayNotification}>Notification</a></li>
                </ul>
            </li>
        </ul>
    )

    const _renderNavSettingActive = () => (
        <ul className="nav page-nav flex-column mb-3">
            <li className="nav-item item-customer-infomation" onClick={handleCustomerInfo}>
                <a href="#" className={isSetting ? 'nav-link' : 'nav-link active'}>Customer Infomation</a>
            </li>

            <li className="nav-item item-setting dropdown">
                <a href="#" className="nav-link dropdown-toggle active" type="button" data-bs-toggle="dropdown" aria-expanded="false">Setting</a>
                <ul className="dropdown-menu show">
                    <li><a className={isTradingPin ? 'dropdown-item item-setting-trading-pin active' : 'dropdown-item item-setting-trading-pin'} onClick={handleDisplayChangeTradingPin}>
                        Change Trading PIN
                    </a></li>
                    <li><a className={isChangePassword ? 'dropdown-item item-setting-password active' : 'dropdown-item item-setting-password'} onClick={handleDisplayChangePassword}>
                        Change Password
                    </a></li>
                    <li><a className={isNotification ? 'dropdown-item item-setting-notification active' : 'dropdown-item item-setting-notification'} onClick={handleDisplayNotification}>
                        Notification
                    </a></li>
                </ul>
            </li>
        </ul>
    )

    const _renderNav = () => (
        <>
            {!isSetting && _renderNavNomal()}
            {isSetting && _renderNavSettingActive()}
        </>
    )

    const _renderContentPage = () => (
        <div className="site-main">
            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        {_renderNav()}
                    </div>
                    <div className="col-md-9">
                        {!isSetting && <CustomerInfomation />}
                        {(isSetting) && <Setting isTradingPin={isTradingPin} isChangePassword={isChangePassword} isNotification={isNotification} />}
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderContentPage()}</>
}

export default CustomerInfo