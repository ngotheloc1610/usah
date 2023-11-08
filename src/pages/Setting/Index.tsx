import { useState, useEffect } from 'react';

import { wsService } from '../../services/websocket-service';
import * as sspb from '../../models/proto/system_service_pb'
import * as rspb from "../../models/proto/rpc_pb";

import { ACCOUNT_ID, SOCKET_CONNECTED, TEAM_ROLE, ROLE_TEAM_LEAD } from '../../constants/general.constant';

import SettingTeamPassword from '../../components/Setting/SettingTeamPassword';
import Setting from '../../components/Setting/Setting';
import './Setting.scss';

const SettingScreen = () => {
    const systemServicePb: any = sspb
    const [isSetting, setIsSetting] = useState(false)
    const [isChangePassword, setIsChangePassword] = useState(true)
    const [isNotification, setIsNotification] = useState(false)
    const [customerInfoDetail, setCustomerInfoDetail] = useState({
        accountId: 0,
        apiFlg: false,
        apiKey: "",
        comment: "",
        email: "",
        enableFlg: false,
        enableSecretKeyFlg: systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_NONE,
        groupId: 0,
        name: "",
        password: "",
        phone: "",
        recvAdminNewsFlg: systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_NONE,
        recvMatchNotiFlg: systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_NONE,
        registeredDate: 0,
        secretKey: "",
        tradingRights: 0,
    })

    const [isSettingTeamPw, setIsSettingTeamPw] = useState(false)
    const account_role_team = sessionStorage.getItem(TEAM_ROLE) || ''

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessageCustomerInfor();;
            }
        });

        const renderDataCustomInfoToScreen = wsService.getCustomerInfoDetail().subscribe(res => {
            setCustomerInfoDetail(res.account)
        });

        return () => {
            ws.unsubscribe();
            renderDataCustomInfoToScreen.unsubscribe();
        }
    }, [])

    const buildMessageCustomInfo = (accountId: string) => {
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let infoDetailRequest = new SystemServicePb.AccountDetailRequest();
            infoDetailRequest.setAccountId(Number(accountId));

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_DETAIL_REQ);
            rpcMsg.setPayloadData(infoDetailRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMessageCustomerInfor = () => {
        
         let accountId = sessionStorage.getItem(ACCOUNT_ID) || '';
        !isSetting && buildMessageCustomInfo(accountId);
    }

    const handleDisplayChangePassword = () => {
        setIsSetting(true);
        setIsNotification(false);
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
                            <Setting isChangePassword={isChangePassword} isNotification={isNotification} customerInfoDetail={customerInfoDetail} />
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