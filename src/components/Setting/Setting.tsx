import { useEffect, useState } from 'react'
import { validationPassword } from '../../helper/utils'
import { ERROR_MESSAGE, MSG_CODE, OBJ_AUTHEN, SUCCESS_MESSAGE, VALIDATE_PASSWORD, VALIDATE_TRADING_PIN } from '../../constants/general.constant'
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
    customerInfoDetail: IAccountDetail
}

const defaultProps = {
    isTradingPin: false,
    isChangePassword: false,
    isNotification: false,
}

const Setting = (props: ISetting) => {
    const { isTradingPin, isChangePassword, isNotification, customerInfoDetail } = props
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
    const [tradingPinFlg, setTradingPinFlg] = useState(true)
    const [customerInfoSetting, setCustomerInfoSetting] = useState([])
    const [statusOrder, setStatusOrder] = useState(0);

    useEffect(() => {
        if (isTradingPin === false || isChangePassword === false) {
            setIsOpenEye(true)
            setIsOpenEyeNew(true)
            setIsOpenEyeConfirm(true)
        }
    }, [isTradingPin, isChangePassword])

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

    const buildMessageNoti = (accountId: string) => {
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let customerInfoRequest = new SystemServicePb.AccountUpdateRequest();
            customerInfoRequest.setAccountId(Number(accountId));
            customerInfoRequest.setRecvAdminNewsFlg(recvAdminNewsFlg);
            customerInfoRequest.setRecvMatchNotiFlg(recvMatchNotiFlg);
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

    const sendMessageCustomerInforNoti = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                isNotification && buildMessageNoti(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                isNotification && buildMessageNoti(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                isNotification && buildMessageNoti(accountId);
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
        ` New password must contain:<ul>
                <li> from 8-30 character </li>
                <li> at least one uppercase letter </li>
                <li> at least one number </li>
                <li> at least one special character (e.g ! @ # ...) </li>
            </ul>`
    )

    const setDisplayBlock = (item: any) => {
        item.style.display = 'block'
    }

    const setDisplayNone = (item: any) => {
        item.style.display = 'none'
    }

    const handleSubmit = () => {
        if (isTradingPin) {
            const elTrading: any = document.querySelector('.trading')
            const elNewTrading: any = document.querySelector('.new-trading')
            const elConfirmTrading: any = document.querySelector('.confirm-trading')
            if (secretKey === newSecretKey) {
                setDisplayBlock(elTrading)
                elTrading.innerHTML = VALIDATE_TRADING_PIN.tradingPinExist
            }
            if (secretKey !== newSecretKey) {
                setDisplayNone(elTrading)
            }
            if (newSecretKey !== confirmTradingPin) {
                setDisplayBlock(elConfirmTrading)
                elConfirmTrading.innerHTML = VALIDATE_TRADING_PIN.incorrectTradingPin
            }
            if (newSecretKey.length > 6 || newSecretKey.length < 6) {
                setDisplayBlock(elNewTrading)
                elNewTrading.innerHTML = VALIDATE_TRADING_PIN.checkTradingPin
                setDisplayNone(elConfirmTrading)
            }
            if (newSecretKey.length === 6) {
                setDisplayNone(elNewTrading)
            }
            if (newSecretKey === confirmTradingPin) {
                setDisplayNone(elConfirmTrading)
            }
            if (secretKey !== newSecretKey && newSecretKey.length === 6 && newSecretKey === confirmTradingPin) {
                sendMsgUpdateTradingPin();
            }
        }

        if (isChangePassword) {
            const elPassword: any = document.querySelector('.password')
            const elNewPw: any = document.querySelector('.new-trading')
            const elConfirmPassword: any = document.querySelector('.confirm-password')
            if (password === newPassword) {
                setDisplayBlock(elPassword)
                elPassword.innerHTML = VALIDATE_PASSWORD.passwordExist
            }
            if (password !== newPassword) {
                setDisplayNone(elPassword)
            }
            if (newPassword !== confirmPassword) {
                setDisplayBlock(elConfirmPassword)
                elConfirmPassword.innerHTML = VALIDATE_PASSWORD.incorrectPassword
            }
            if (!validationPassword(newPassword)) {
                setDisplayBlock(elNewPw)
                setDisplayNone(elConfirmPassword)
                elNewPw.innerHTML = _renderMsgError()
            }
            if (validationPassword(newPassword)) {
                setDisplayNone(elNewPw)
            }
            if (newPassword === confirmPassword) {
                setDisplayNone(elConfirmPassword)
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

    const _renderMessageError = () => (
        <div>{toast.error(ERROR_MESSAGE.updateError)}</div>
    )

    const _renderMessageSuccess = () => {
        return <div>{toast.success(SUCCESS_MESSAGE.updateSuccess)}</div>
    }

    const handleClickEyeTradingPin = (event: any) => {
        setIsOpenEye(!isOpenEye)
        const elCurrent = document.getElementById('trading-pin')
        isOpenEye ? elCurrent?.setAttribute('type', 'text') : elCurrent?.setAttribute('type', 'password')
        event.target?.classList.toggle('bi-eye-slash')
    }

    const handleClickNewTradingPin = (event: any) => {
        setIsOpenEyeNew(!isOpenEyeNew)
        const elNew = document.getElementById('new-trading-pin')
        isOpenEyeNew ? elNew?.setAttribute('type', 'text') : elNew?.setAttribute('type', 'password')
        event.target?.classList.toggle('bi-eye-slash')
    }

    const handleClickEyeConfirmTradingPin = (event: any) => {
        setIsOpenEyeConfirm(!isOpenEyeConfirm)
        const elConfirm = document.getElementById('confirm-trading-pin')
        isOpenEyeConfirm ? elConfirm?.setAttribute('type', 'text') : elConfirm?.setAttribute('type', 'password')
        event.target?.classList.toggle('bi-eye-slash')
    }

    const changeNewsAdmin = (checked: boolean) => {
        const systemServicePb: any = sspb
        let newsAdmin: number = 0
        checked ? newsAdmin = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON : newsAdmin = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_OFF
        setRecvAdminNewsFlg(newsAdmin)
        sendMessageCustomerInforNoti()
    }

    const changeNewsNotication = (checked: boolean) => {
        const systemServicePb: any = sspb
        let newsNotication: number = 0
        checked ? newsNotication = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_ON : newsNotication = systemServicePb.AccountUpdateRequest.BoolFlag.BOOL_FLAG_OFF
        setRecvMatchNotiFlg(newsNotication)
        sendMessageCustomerInforNoti()
    }

    const _renderChanngeTraddingPin = (isTradingPin: boolean) => (
        <>
            <div className="row align-items-center">
                <div className="col-md-3  mb-1 mb-md-0">
                    <label className="text-secondary">{isTradingPin ? 'Current Trading PIN' : 'Current Password'}</label>
                </div>
                <div className="col-md-4">
                    <div className="input-group input-group-pw">
                        <input id='trading-pin' type="password" className="form-control"
                            value={isTradingPin ? secretKey : password}
                            onChange={(event) => changeTradingPin(event.target.value)}
                            minLength={isTradingPin ? 0 : 8}
                            maxLength={isTradingPin ? 6 : 30}
                        />
                        <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                            <i onClick={handleClickEyeTradingPin} className="bi bi-eye-fill opacity-50 pad-12" />
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
                <div className="col-md-4">
                    <div className="input-group input-group-pw">
                        <input id='new-trading-pin' type="password" className="form-control"
                            value={isTradingPin ? newSecretKey : newPassword}
                            onChange={(event) => changeNewTradingPin(event.target.value)}
                            minLength={isTradingPin ? 0 : 8}
                            maxLength={isTradingPin ? 6 : 30}
                        />
                        <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                            <i onClick={handleClickNewTradingPin} className="bi bi-eye-fill opacity-50 pad-12"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="row mb-3 align-items-center">
                <div className="col-md-3  mb-1 mb-md-0"></div>
                <div className="col-md-4">
                    <div className='trading password'></div>
                    <div className='new-trading new-password'></div>
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
                <div className="col-md-4">
                    <div className="input-group input-group-pw">
                        <input id='confirm-trading-pin' type="password" className="form-control"
                            value={isTradingPin ? confirmTradingPin : confirmPassword}
                            onChange={(event) => confirmNewTradingPin(event.target.value)}
                            minLength={isTradingPin ? 0 : 8}
                            maxLength={isTradingPin ? 6 : 30}
                        />
                        <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                            <i onClick={handleClickEyeConfirmTradingPin} className="bi bi-eye-fill opacity-50 pad-12"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="row mb-3 align-items-center">
                <div className="col-md-3  mb-1 mb-md-0"></div>
                <div className="col-md-4">
                    <div className='confirm-trading confirm-password'></div>
                </div>
            </div>
        </>
    )

    const changeTradingPinFlg = (checked: boolean) => {
        const el: any = document.querySelector('.trading-pin-form')
        !checked ? el.style.display = 'none' : el.style.display = 'block'
        setTradingPinFlg(checked)
    }

    useEffect(() => {
        if (isTradingPin) {
            const el: any = document.querySelector('.trading-pin-form')
            !tradingPinFlg ? el.style.display = 'none' : el.style.display = 'block'
        }
    }, [isTradingPin])

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
                                    checked={tradingPinFlg}
                                    onChange={(event) => changeTradingPinFlg(event.target.checked)}
                                />
                                <label className='trading-pin-flg'>{tradingPinFlg ? 'On' : 'Off'}</label>
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