import { useState } from 'react'
import { IParamTradingPin } from '../../interfaces/confirmInfor.interface'
interface ISetting {
    isTradingPin: boolean;
    isChangePassword: boolean;
    isNotification: boolean;
    getParamTradingPin: any
}

const defaultProps = {
    isTradingPin: false,
    isChangePassword: false,
    isNotification: false,
}

const Setting = (props: ISetting) => {
    const { isTradingPin, isChangePassword, isNotification, getParamTradingPin } = props
    const [tradingPin, setTradingPin] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newTradingPin, setNewTradingPin] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmTradingPin, setConfirmTradingPin] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isOpenEye, setIsOpenEye] = useState(true)
    const [isOpenEyeNew, setIsOpenEyeNew] = useState(true)
    const [isOpenEyeConfirm, setIsOpenEyeConfirm] = useState(true)
    const paramTradingPin: IParamTradingPin = {
        secretKey: '',
        newSecretKey: ''
    }

    const changeTradingPin = (event: any) => {
        isTradingPin && setTradingPin(event.target.value)
        isChangePassword && setCurrentPassword(event.target.value)
    }

    const changeNewTradingPin = (event: any) => {
        isTradingPin && setNewTradingPin(event.target.value)
        isChangePassword && setNewPassword(event.target.value)
    }

    const confirmNewTradingPin = (event: any) => {
        isTradingPin && setConfirmTradingPin(event.target.value)
        isChangePassword && setConfirmPassword(event.target.value)
    }

    const handleSubmit = () => {
        getParamTradingPin(paramTradingPin)
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

    const _renderChanngeTraddingPin = (isTradingPin: boolean) => (
        <div className="row mb-3 align-items-center">
            <div className="col-md-3  mb-1 mb-md-0">
                <label className="text-secondary">{isTradingPin ? 'Current Trading PIN' : 'Current Password'}</label>
            </div>
            <div className="col-md-4">
                <div className="input-group input-group-pw">
                    <input id='trading-pin' type="password" className="form-control"
                        value={isTradingPin ? tradingPin : currentPassword} onChange={changeTradingPin}
                    />
                    <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                        <i onClick={handleClickEyeTradingPin} className="bi bi-eye-fill opacity-50 pad-12" />
                    </button>
                </div>
            </div>
        </div>
    )

    const _renderNewTradingPin = (isTradingPin: boolean) => (
        <div className="row mb-3 align-items-center">
            <div className="col-md-3  mb-1 mb-md-0">
                <label className="text-secondary">{isTradingPin ? 'New Trading PIN' : 'New Password'}</label>
            </div>
            <div className="col-md-4">
                <div className="input-group input-group-pw">
                    <input id='new-trading-pin' type="password" className="form-control"
                        value={isTradingPin ? newTradingPin : newPassword} onChange={changeNewTradingPin}
                    />
                    <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                        <i onClick={handleClickNewTradingPin} className="bi bi-eye-fill opacity-50 pad-12"></i>
                    </button>
                </div>
            </div>
        </div>
    )

    const _renderConfirmTradingPin = (isTradingPin: boolean) => (
        <div className="row mb-3 align-items-center">
            <div className="col-md-3  mb-1 mb-md-0">
                <label className="text-secondary">{isTradingPin ? 'Confirm trading PIN' : 'Confirm Password'}</label>
            </div>
            <div className="col-md-4">
                <div className="input-group input-group-pw">
                    <input id='confirm-trading-pin' type="password" className="form-control"
                        value={isTradingPin ? confirmTradingPin : confirmPassword} onChange={confirmNewTradingPin}
                    />
                    <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" >
                        <i onClick={handleClickEyeConfirmTradingPin} className="bi bi-eye-fill opacity-50 pad-12"></i>
                    </button>
                </div>
            </div>
        </div>
    )

    const _renderSettingTemplate = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <h4 className="border-bottom pb-1 mb-3"><i className="bi bi-gear-fill opacity-50"></i> <strong>Setting</strong></h4>
                <div className="mb-4">
                    <h6 className="c-title text-primary mb-3">{isTradingPin ? 'Channge Tradding PIN' : 'Change Password'}</h6>
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
                        <input className="form-check-input" type="checkbox" role="switch" id="news_admin" />
                        <label className="form-check-label" htmlFor="news_admin">Receive admin news</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="news_notication" />
                        <label className="form-check-label" htmlFor="news_notication">Receive matched results notification</label>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>
        {!isNotification && _renderSettingTemplate()}
        {isNotification && _renderSettingNotification()}
    </>
}

Setting.defaultProps = defaultProps

export default Setting