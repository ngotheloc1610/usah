import Setting from '../../components/Setting/Setting';
import './Setting.scss';
import { wsService } from '../../services/websocket-service';
import queryString from 'query-string';
import * as sspb from '../../models/proto/system_service_pb'
import * as rspb from "../../models/proto/rpc_pb";
import ReduxPersist from '../../config/ReduxPersist';
import { OBJ_AUTHEN, SOCKET_CONNECTED } from '../../constants/general.constant';
import { useState, useEffect } from 'react';

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
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                !isSetting && buildMessageCustomInfo(accountId)
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                !isSetting && buildMessageCustomInfo(accountId)
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                !isSetting && buildMessageCustomInfo(accountId)
                return;
            }
        });
    }

    const handleDisplayChangePassword = () => {
        setIsSetting(true);
        setIsNotification(false);
        setIsChangePassword(true);
    }

    const handleDisplayNotification = () => {
        setIsSetting(true);
        setIsNotification(true);
        setIsChangePassword(false);
    }

    const _renderNavSettingActive = () => (
        <ul className="nav page-nav flex-column mb-3">
            <li className="nav-item item-setting dropdown">
                <a href="#" className="nav-link dropdown-toggle active" type="button" data-bs-toggle="dropdown" aria-expanded="false">Setting</a>
                <ul className="dropdown-menu show">
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
                        <Setting isChangePassword={isChangePassword} isNotification={isNotification} customerInfoDetail={customerInfoDetail} />
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderContentPage()}</>
}

export default SettingScreen