import { useState } from 'react';

import { TEAM_ROLE, ROLE_TEAM_LEAD } from '../../constants/general.constant';

import SettingTeamPassword from '../../components/Setting/SettingTeamPassword';
import Setting from '../../components/Setting/Setting';
import './Setting.scss';

const SettingScreen = () => {
    const [isChangePassword, setIsChangePassword] = useState(true)

    const [isSettingTeamPw, setIsSettingTeamPw] = useState(false)
    const account_role_team = sessionStorage.getItem(TEAM_ROLE) || ''

    const handleDisplayChangePassword = () => {
        setIsChangePassword(true);
        setIsSettingTeamPw(false)
    }

    const _renderNavSettingActive = () => (
        <ul className="nav page-nav flex-column mb-3">
            <li className="nav-item item-setting dropdown">
                <a href="#" className="nav-link active" type="button" data-bs-toggle="dropdown" aria-expanded="false">Setting</a>
                <ul className="dropdown-menu show">
                    <li><a className={isChangePassword ? 'dropdown-item item-setting-password active' :'dropdown-item item-setting-password'} onClick={handleDisplayChangePassword}>
                        Change Account Password
                    </a></li>
                    {account_role_team === ROLE_TEAM_LEAD && (
                        <li>
                            <a 
                                className={isSettingTeamPw ? 'dropdown-item item-setting-password active' : 'dropdown-item item-setting-password'} 
                                onClick={() => {
                                    setIsSettingTeamPw(true)
                                    setIsChangePassword(false)
                                }}
                            >
                            Change Team ID Password
                            </a>
                        </li>
                    )}
                </ul>
            </li>
        </ul>
    )

    const _renderNav = () => (
        <>
            { _renderNavSettingActive()}
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
                        {isChangePassword && (
                            <Setting isChangePassword={isChangePassword} />
                        )}
                        {isSettingTeamPw && account_role_team === ROLE_TEAM_LEAD && (
                            <SettingTeamPassword />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderContentPage()}</>
}

export default SettingScreen