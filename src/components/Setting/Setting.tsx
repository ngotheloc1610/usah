import { useEffect, useState } from 'react'
import { validationPassword } from '../../helper/utils'
import { MSG_CODE, ERROR_MSG_VALIDATE, MESSAGE_TOAST, ADMIN_NEWS_FLAG, MATCH_NOTI_FLAG, MAX_LENGTH_PASSWORD, LENGTH_PASSWORD, ACCOUNT_ID } from '../../constants/general.constant'
import { toast } from 'react-toastify'
import * as smpb from '../../models/proto/system_model_pb';
import * as sspb from '../../models/proto/system_service_pb'
import * as rspb from "../../models/proto/rpc_pb";
import { wsService } from '../../services/websocket-service'
import ReduxPersist from '../../config/ReduxPersist'
import queryString from 'query-string';
import { IAccountDetail } from '../../interfaces/customerInfo.interface'

interface ISetting {
    isChangePassword: boolean;
    isNotification: boolean;
    customerInfoDetail: IAccountDetail;
}

const defaultProps = {
    isChangePassword: false,
    isNotification: false,
}

const Setting = (props: ISetting) => {
    const { isChangePassword, isNotification, customerInfoDetail } = props
    const systemServicePb: any = sspb
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
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

    localStorage.setItem(ADMIN_NEWS_FLAG, JSON.stringify(recvAdminNewsFlg))
    localStorage.setItem(MATCH_NOTI_FLAG, JSON.stringify(recvMatchNotiFlg))

    useEffect(() => {
        if (!isChangePassword) {
            setIsOpenEye(true)
            setIsOpenEyeNew(true)
            setIsOpenEyeConfirm(true)
        }
    }, [isChangePassword])

    useEffect(() => {
        setPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setCheckPass(false)
        setCheckNewPass(false)
        setCheckConfirm(false)
    }, [isChangePassword])

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

    const sendMessageSettingPass = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessagePassword(accountId);
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
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessageAdNewsNoti(accountId, newsAdmin);
    }

    const sendMessageMatchNoti = (matchNoti: number) => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessageMatchNoti(accountId, matchNoti);
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

    const sendMsgUpdatePassword = () => {
        sendMessageSettingPass()
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

    const _renderChanngePassword = () => (
        <>
            <div className="row align-items-center">
                <div className="col-md-3  mb-1 mb-md-0">
                    <label className="text-secondary">Current Password</label>
                </div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className="input-group input-group-pw">
                        <input type={isOpenEye ? "password" : "text"} className="form-control"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
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

    const _renderNewPassword = () => (
        <>
            <div className="row align-items-center">
                <div className="col-md-3  mb-1 mb-md-0">
                    <label className="text-secondary">New Password</label>
                </div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className="input-group input-group-pw">
                        <input type={isOpenEyeNew ? "password" : "text"} className="form-control"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            minLength={LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
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
                        {isChangePassword && checkPass ? ERROR_MSG_VALIDATE.PASSWORD_EXIST : ''}
                    </div>
                    <div className='new-password'>
                        {isChangePassword && checkNewPass ? _renderMsgError() : ''}
                    </div>
                </div>
            </div>
        </>
    )

    const _renderConfirmPassword = () => (
        <>
            <div className="row align-items-center">
                <div className="col-md-3  mb-1 mb-md-0">
                    <label className="text-secondary">Confirm Password</label>
                </div>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    <div className="input-group input-group-pw">
                        <input type={isOpenEyeConfirm ? "password" : "text"} className="form-control"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            minLength={LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
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
                    <div className='confirm-password'>
                        {isChangePassword && checkConfirm ? ERROR_MSG_VALIDATE.PASSORD_INCORRECT : ''}
                    </div>
                </div>
            </div>
        </>
    )

    const _renderSettingTemplate = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <h4 className="border-bottom pb-1 mb-3"><i className="bi bi-gear-fill opacity-50"></i> <strong>Setting</strong></h4>
                <h6 className="c-title text-primary mb-3">Change Password</h6>
                <div className="mb-4 trading-pin-form">
                    {_renderChanngePassword()}
                    {_renderNewPassword()}
                    {_renderConfirmPassword()}
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
        {isChangePassword && _renderSettingTemplate()}
        {isNotification && _renderSettingNotification()}
    </>
}

Setting.defaultProps = defaultProps

export default Setting