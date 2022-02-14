import { useEffect, useState } from 'react'
import { validationPassword } from '../../helper/utils'
import { MSG_CODE, OBJ_AUTHEN, ERROR_MSG_VALIDATE, MESSAGE_TOAST, ENABLE_TRADING_PIN, ADMIN_NEWS, MATCH_NOTI, ENABLE_BUTTON } from '../../constants/general.constant'
import { toast } from 'react-toastify'
import * as smpb from '../../models/proto/system_model_pb';
import * as sspb from '../../models/proto/system_service_pb'
import * as rspb from "../../models/proto/rpc_pb";
import { wsService } from '../../services/websocket-service'
import ReduxPersist from '../../config/ReduxPersist'
import queryString from 'query-string';
import { IAccountDetail } from '../../interfaces/customerInfo.interface'

interface ISetting {
    isTradingPin: boolean;
    isChangePassword: boolean;
    isNotification: boolean;
    customerInfoDetail: IAccountDetail;
}

const defaultProps = {
    isTradingPin: false,
    isChangePassword: false,
    isNotification: false,
}

const Setting = (props: ISetting) => {
    const { isTradingPin, isChangePassword, isNotification, customerInfoDetail } = props
    const systemServicePb: any = sspb
    const [secretKey, setSecretKey] = useState('')
    const [password, setPassword] = useState('')
    const [newSecretKey, setNewSecretKey] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmTradingPin, setConfirmTradingPin] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isOpenEye, setIsOpenEye] = useState(true)
    const [isOpenEyeNew, setIsOpenEyeNew] = useState(true)
    const [isOpenEyeConfirm, setIsOpenEyeConfirm] = useState(true)
    const [recvAdminNewsFlg, setRecvAdminNewsFlg] = useState(customerInfoDetail.recvAdminNewsFlg)
    const [recvMatchNotiFlg, setRecvMatchNotiFlg] = useState(customerInfoDetail.recvMatchNotiFlg)
    const [customerInfoSetting, setCustomerInfoSetting] = useState([])
    const [statusOrder, setStatusOrder] = useState(0);
    const [checkPass, setCheckPass] = useState(false)
    const [checkNewPass, setCheckNewPass] = useState(false)
    const [checkConfirm, setCheckConfirm] = useState(false)
    const [enableSecretKey, setEnableSecretKey] = useState(customerInfoDetail.enableSecretKeyFlg)

    localStorage.setItem(ENABLE_TRADING_PIN, JSON.stringify(enableSecretKey))
    localStorage.setItem(ADMIN_NEWS, JSON.stringify(recvAdminNewsFlg))
    localStorage.setItem(MATCH_NOTI, JSON.stringify(recvMatchNotiFlg))

    useEffect(() => {
        if (isTradingPin === false || isChangePassword === false) {
            setIsOpenEye(true)
            setIsOpenEyeNew(true)
            setIsOpenEyeConfirm(true)
        }
    }, [isTradingPin, isChangePassword])

    useEffect(() => {
        setSecretKey('')
        setNewSecretKey('')
        setConfirmTradingPin('')
        setPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setCheckPass(false)
        setCheckNewPass(false)
        setCheckConfirm(false)
    }, [isTradingPin, isChangePassword])

    useEffect(() => {
        if (isTradingPin) {
            const el: any = document.querySelector('.trading-pin-form')
            enableSecretKey !== systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON ? el.style.display = 'none' : el.style.display = 'block'
        }
    }, [isTradingPin])

    useEffect(() => {
        const systemModelPb: any = smpb
        const renderDataCustomInfoToScreen = wsService.getCustomerSettingSubject().subscribe(res => {
            if (res[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                setCustomerInfoSetting(res)
                _renderMessageSuccess();
            } else {
                _renderMessageError();
            }
            return;
        });

        return () => renderDataCustomInfoToScreen.unsubscribe();
    }, [])

    const buildMessageTradingPin = (accountId: string) => {
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let customerInfoRequest = new SystemServicePb.AccountUpdateRequest();
            customerInfoRequest.setAccountId(Number(accountId));
            customerInfoRequest.setSecretKey(secretKey);
            customerInfoRequest.setNewSecretKey(newSecretKey);

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_UPDATE_REQ);
            rpcMsg.setPayloadData(customerInfoRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const buildMessagePassword = (accountId: string) => {
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let customerInfoRequest = new SystemServicePb.AccountUpdateRequest();
            customerInfoRequest.setAccountId(Number(accountId));
            customerInfoRequest.setPassword(password);
            customerInfoRequest.setNewPassword(newPassword);

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_UPDATE_REQ);
            rpcMsg.setPayloadData(customerInfoRequest.serializeBinary());
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
                isTradingPin && buildMessageTradingPin(accountId);
                isChangePassword && buildMessagePassword(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                isTradingPin && buildMessageTradingPin(accountId);
                isChangePassword && buildMessagePassword(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                isTradingPin && buildMessageTradingPin(accountId);
                isChangePassword && buildMessagePassword(accountId);
                return;
            }
        });
    }

    const buildMessageAdNewsNoti = (accountId: string, newsAdmin: number) => {
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let customerInfoRequest = new SystemServicePb.AccountUpdateRequest();
            customerInfoRequest.setAccountId(Number(accountId));
            customerInfoRequest.setRecvAdminNewsFlg(newsAdmin);
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_UPDATE_REQ);
            rpcMsg.setPayloadData(customerInfoRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const buildMessageMatchNoti = (accountId: string, matchNoti: number) => {
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let customerInfoRequest = new SystemServicePb.AccountUpdateRequest();
            customerInfoRequest.setAccountId(Number(accountId));
            customerInfoRequest.setRecvMatchNotiFlg(matchNoti);
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_UPDATE_REQ);
            rpcMsg.setPayloadData(customerInfoRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMessageAdNewsNoti = (newsAdmin: number) => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessageAdNewsNoti(accountId, newsAdmin);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessageAdNewsNoti(accountId, newsAdmin);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                buildMessageAdNewsNoti(accountId, newsAdmin);
                return;
            }
        });
    }

    const sendMessageMatchNoti = (matchNoti: number) => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessageMatchNoti(accountId, matchNoti);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessageMatchNoti(accountId, matchNoti);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                buildMessageMatchNoti(accountId, matchNoti);
                return;
            }
        });
    }

    const buildMsgEnableTradingPin = (accountId: string, enableFlg: number) => {
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let customerInfoRequest = new SystemServicePb.AccountUpdateRequest();

            customerInfoRequest.setAccountId(Number(accountId));
            customerInfoRequest.setEnableSecretKeyFlg(enableFlg);

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_UPDATE_REQ);
            rpcMsg.setPayloadData(customerInfoRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMsgEnableTradingPin = (enableFlg: number) => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMsgEnableTradingPin(accountId, enableFlg);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMsgEnableTradingPin(accountId, enableFlg);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                buildMsgEnableTradingPin(accountId, enableFlg);
                return;
            }
        });
    }

    const changeTradingPin = (value: string) => {
        isTradingPin && setSecretKey(value)
        isChangePassword && setPassword(value)
    }

    const changeNewTradingPin = (value: string) => {
        isTradingPin && setNewSecretKey(value)
        isChangePassword && setNewPassword(value)
    }

    const confirmNewTradingPin = (value: string) => {
        isTradingPin && setConfirmTradingPin(value)
        isChangePassword && setConfirmPassword(value)
    }

    const _renderMsgError = () => (
        <>
            New password must contain:
            <ul>
                <li> from 8-30 character </li>
                <li> at least one uppercase letter </li>
                <li> at least one number </li>
                <li> at least one special character (e.g ! @ # ...) </li>
            </ul>
        </>
    )

    const handleSubmit = () => {
        if (isTradingPin) {
            if (secretKey === newSecretKey) {
                setCheckPass(true)
            }
            if (secretKey !== newSecretKey) {
                setCheckPass(false)
            }
            if (newSecretKey !== confirmTradingPin) {
                setCheckConfirm(true)
            }
            if (newSecretKey.length > 6 || newSecretKey.length < 6) {
                setCheckNewPass(true)
                setCheckConfirm(false)
            }
            if (newSecretKey.length === 6) {
                setCheckNewPass(false)
            }
            if (newSecretKey === confirmTradingPin) {
                setCheckConfirm(false)
            }
            if (secretKey !== newSecretKey && newSecretKey.length === 6 && newSecretKey === confirmTradingPin) {
                sendMsgUpdateTradingPin();
            }
        }

        if (isChangePassword) {
            if (password === newPassword) {
                setCheckPass(true)
            }
            if (password !== newPassword) {
                setCheckPass(false)
            }
            if (newPassword !== confirmPassword) {
                setCheckConfirm(true)
            }
            if (!validationPassword(newPassword)) {
                setCheckNewPass(true)
                setCheckConfirm(false)
            }
            if (validationPassword(newPassword)) {
                setCheckNewPass(false)
            }
            if (newPassword === confirmPassword) {
                setCheckConfirm(false)
            }
            if (password !== newPassword && validationPassword(newPassword) && newPassword === confirmPassword) {
                sendMsgUpdatePassword()
            }
        }
    }

    const sendMsgUpdateTradingPin = () => {
        sendMessageCustomerInfor()
        setSecretKey('')
        setNewSecretKey('')
        setConfirmTradingPin('')
    }

    const sendMsgUpdatePassword = () => {
        sendMessageCustomerInfor()
        setPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    const _renderMessageError = () => (
        <div>{toast.error(MESSAGE_TOAST.ERROR_UPDATE)}</div>
    )

    const _renderMessageSuccess = () => {
        return <div>{toast.success(MESSAGE_TOAST.SUCCESS_UPDATE)}</div>
    }

    const changeNewsAdmin = (checked: boolean) => {
        let newsAdmin: number = 0
        checked ? newsAdmin = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON : newsAdmin = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_OFF
        setRecvAdminNewsFlg(newsAdmin)
        sendMessageAdNewsNoti(newsAdmin)
    }

    const changeNewsNotication = (checked: boolean) => {
        let matchNoti: number = 0
        checked ? matchNoti = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON : matchNoti = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_OFF
        setRecvMatchNotiFlg(matchNoti)
        sendMessageMatchNoti(matchNoti)
    }

    const _renderChanngeTraddingPin = (isTradingPin: boolean) => (
        <>
            <div className="row align-items-center">
                <div className="col-md-3  mb-1 mb-md-0">
                    <label className="text-secondary">{isTradingPin ? 'Current Trading PIN' : 'Current Password'}</label>
                </div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className="input-group input-group-pw">
                        <input id='trading-pin' type={isOpenEye ? "password" : "text"} className="form-control"
                            value={isTradingPin ? secretKey : password}
                            onChange={(event) => changeTradingPin(event.target.value)}
                            minLength={isTradingPin ? 0 : 8}
                            maxLength={isTradingPin ? 6 : 30}
                        />
                        <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                            <i onClick={() => setIsOpenEye(!isOpenEye)}
                                className={`bi ${isOpenEye ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12`}
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div className="row mb-3 align-items-center">
                <div className="col-md-3  mb-1 mb-md-0"></div>
                <div className="col-md-4">
                </div>
            </div>
        </>
    )

    const _renderNewTradingPin = (isTradingPin: boolean) => (
        <>
            <div className="row align-items-center">
                <div className="col-md-3  mb-1 mb-md-0">
                    <label className="text-secondary">{isTradingPin ? 'New Trading PIN' : 'New Password'}</label>
                </div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className="input-group input-group-pw">
                        <input id='new-trading-pin' type={isOpenEyeNew ? "password" : "text"} className="form-control"
                            value={isTradingPin ? newSecretKey : newPassword}
                            onChange={(event) => changeNewTradingPin(event.target.value)}
                            minLength={isTradingPin ? 0 : 8}
                            maxLength={isTradingPin ? 6 : 30}
                        />
                        <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                            <i onClick={() => setIsOpenEyeNew(!isOpenEyeNew)}
                                className={`bi ${isOpenEyeNew ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12`}
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div className="row mb-3 align-items-center">
                <div className="col-md-3  mb-1 mb-md-0"></div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className='trading password'>
                        {isTradingPin && checkPass ? ERROR_MSG_VALIDATE.TRADING_PIN_EXIST : ''}
                        {isChangePassword && checkPass ? ERROR_MSG_VALIDATE.PASSWORD_EXIST : ''}
                    </div>
                    <div className='new-trading new-password'>
                        {isTradingPin && checkNewPass ? ERROR_MSG_VALIDATE.TRADING_PIN_NOT_VALID : ''}
                        {isChangePassword && checkNewPass ? _renderMsgError() : ''}
                    </div>
                </div>
            </div>
        </>
    )

    const _renderConfirmTradingPin = (isTradingPin: boolean) => (
        <>
            <div className="row align-items-center">
                <div className="col-md-3  mb-1 mb-md-0">
                    <label className="text-secondary">{isTradingPin ? 'Confirm trading PIN' : 'Confirm Password'}</label>
                </div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className="input-group input-group-pw">
                        <input id='confirm-trading-pin' type={isOpenEyeConfirm ? "password" : "text"} className="form-control"
                            value={isTradingPin ? confirmTradingPin : confirmPassword}
                            onChange={(event) => confirmNewTradingPin(event.target.value)}
                            minLength={isTradingPin ? 0 : 8}
                            maxLength={isTradingPin ? 6 : 30}
                        />
                        <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                            <i onClick={() => setIsOpenEyeConfirm(!isOpenEyeConfirm)}
                                className={`bi ${isOpenEyeConfirm ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12`}
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div className="row mb-3 align-items-center">
                <div className="col-md-3  mb-1 mb-md-0"></div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className='confirm-trading confirm-password'>
                        {isTradingPin && checkConfirm ? ERROR_MSG_VALIDATE.TRADING_PIN_INCORRECT : ''}
                        {isChangePassword && checkConfirm ? ERROR_MSG_VALIDATE.PASSORD_INCORRECT : ''}
                    </div>
                </div>
            </div>
        </>
    )

    const handleEnableTradingPin = (checked: boolean) => {
        const el: any = document.querySelector('.trading-pin-form')
        !checked ? el.style.display = 'none' : el.style.display = 'block'
        const enableFlg: number = checked ? systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON : systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_OFF
        setEnableSecretKey(enableFlg)
        sendMsgEnableTradingPin(enableFlg)
    }

    const _renderSettingTemplate = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <h4 className="border-bottom pb-1 mb-3"><i className="bi bi-gear-fill opacity-50"></i> <strong>Setting</strong></h4>
                <h6 className="c-title text-primary mb-3">{isTradingPin ? 'Change Trading PIN' : 'Change Password'}</h6>
                {isTradingPin && <div className="mb-4">
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3 text-secondary">Trading PIN</div>
                        <div className="col-md-4">
                            <div className='form-check form-switch'>
                                <input className="form-check-input" type="checkbox" role="switch" id="trading_pin"
                                    checked={enableSecretKey === systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON ? true : false}
                                    onChange={(event) => handleEnableTradingPin(event.target.checked)}
                                />
                                <label className='trading-pin-flg'>{enableSecretKey === systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON ? ENABLE_BUTTON.ON : ENABLE_BUTTON.OFF}</label>
                            </div>
                        </div>
                    </div>
                </div>}
                <div className="mb-4 trading-pin-form">
                    {_renderChanngeTraddingPin(isTradingPin)}
                    {_renderNewTradingPin(isTradingPin)}
                    {_renderConfirmTradingPin(isTradingPin)}
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3">
                            &nbsp;
                        </div>
                        <div className="col-md-4">
                            <a href="#" className="btn btn-primary px-4" onClick={handleSubmit}>Save</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const _renderSettingNotification = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <h4 className="border-bottom pb-1 mb-3"><i className="bi bi-gear-fill opacity-50"></i> <strong>Setting</strong></h4>
                <div className="mb-4">
                    <h6 className="c-title text-primary mb-3">Notification</h6>
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="news_admin"
                            checked={recvAdminNewsFlg === 1 ? true : false}
                            onChange={(event) => changeNewsAdmin(event.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="news_admin">Receive admin news</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="news_notication"
                            checked={recvMatchNotiFlg === 1 ? true : false}
                            onChange={(event) => changeNewsNotication(event.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="news_notication">Receive matched results notification</label>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>
        {isTradingPin && _renderSettingTemplate()}
        {isChangePassword && _renderSettingTemplate()}
        {isNotification && _renderSettingNotification()}
    </>
}

Setting.defaultProps = defaultProps

export default Setting