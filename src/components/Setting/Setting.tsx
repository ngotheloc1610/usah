import { useEffect, useState } from 'react'
import { IParamTradingPin, IParamPassword, IParamNoti } from '../../interfaces/customerInfo.interface'
import { validationPassword } from '../../helper/utils'
import { VALIDATE_PASSWORD, VALIDATE_TRADING_PIN } from '../../constants/general.constant'
interface ISetting {
    isTradingPin: boolean;
    isChangePassword: boolean;
    isNotification: boolean;
    getParamTradingPin: (item: IParamTradingPin) => void;
    getParamPassword: (item: IParamPassword) => void;
    getParamNoti: (item: IParamNoti) => void;
}

const defaultProps = {
    isTradingPin: false,
    isChangePassword: false,
    isNotification: false,
}

const Setting = (props: ISetting) => {
    const { isTradingPin, isChangePassword, isNotification, getParamTradingPin, getParamPassword, getParamNoti } = props
    const [tradingPin, setTradingPin] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newTradingPin, setNewTradingPin] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmTradingPin, setConfirmTradingPin] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isOpenEye, setIsOpenEye] = useState(true)
    const [isOpenEyeNew, setIsOpenEyeNew] = useState(true)
    const [isOpenEyeConfirm, setIsOpenEyeConfirm] = useState(true)
    const [newsAdmin, setNewsAdmin] = useState(JSON.parse(localStorage.getItem('newsAdmin') || '{}'))
    const [newsNotication, setNewsNotication] = useState(JSON.parse(localStorage.getItem('newsNotication') || '{}'))
    const paramTradingPin: IParamTradingPin = {
        secretKey: tradingPin,
        newSecretKey: newTradingPin,
    }
    const paramPassword: IParamPassword = {
        password: currentPassword,
        newPassword: newPassword,
    }
    const paramNoti: IParamNoti = {
        recvAdminNewsFlg: newsAdmin,
        recvMatchNotiFlg: newsNotication
    }
    useEffect(() => getParamNoti(paramNoti), [newsAdmin, newsNotication])

    useEffect(() => {
        if (isTradingPin === false || isChangePassword === false) {
            setIsOpenEye(true)
            setIsOpenEyeNew(true)
            setIsOpenEyeConfirm(true)
        }
    }, [isTradingPin, isChangePassword])

    const changeTradingPin = (value: string) => {
        isTradingPin && setTradingPin(value)
        isChangePassword && setCurrentPassword(value)
    }

    const changeNewTradingPin = (value: string) => {
        isTradingPin && setNewTradingPin(value)
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
            if (tradingPin === newTradingPin) {
                setDisplayBlock(elTrading)
                elTrading.innerHTML = VALIDATE_TRADING_PIN.tradingPinExist
            }
            if (tradingPin !== newTradingPin) {
                setDisplayNone(elTrading)
            }
            if (newTradingPin !== confirmTradingPin) {
                setDisplayBlock(elConfirmTrading)
                elConfirmTrading.innerHTML = VALIDATE_TRADING_PIN.incorrectTradingPin
            }
            if (newTradingPin.length > 6 || newTradingPin.length < 6) {
                setDisplayBlock(elNewTrading)
                elNewTrading.innerHTML = VALIDATE_TRADING_PIN.checkTradingPin
                setDisplayNone(elConfirmTrading)
            }
            if (newTradingPin.length === 6) {
                setDisplayNone(elNewTrading)
            }
            if (newTradingPin === confirmTradingPin) {
                setDisplayNone(elConfirmTrading)
            }
            if (newTradingPin.length === 6 && newTradingPin === confirmTradingPin) {
                getParamTradingPin(paramTradingPin)
                setTradingPin('')
                setNewTradingPin('')
                setConfirmTradingPin('')
            }
        }
        if (isChangePassword) {
            const elPassword: any = document.querySelector('.password')
            const elNewPw: any = document.querySelector('.new-trading')
            const elConfirmPassword: any = document.querySelector('.confirm-password')
            if (currentPassword === newPassword) {
                setDisplayBlock(elPassword)
                elPassword.innerHTML = VALIDATE_PASSWORD.passwordExist
            }
            if (currentPassword !== newPassword) {
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
            if (validationPassword(newPassword) ) {
                setDisplayNone(elNewPw)
            }
            if (newPassword === confirmPassword) {
                setDisplayNone(elConfirmPassword)
            }
            if (validationPassword(newPassword) && newPassword === confirmPassword) {
                getParamPassword(paramPassword)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        }
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
        localStorage.setItem('newsAdmin', JSON.stringify(checked))
        const newsAdminJson = JSON.parse(localStorage.getItem('newsAdmin') || '{}')
        setNewsAdmin(newsAdminJson)
    }

    const changeNewsNotication = (checked: boolean) => {
        localStorage.setItem('newsNotication', JSON.stringify(checked))
        const newsNoticationJson = JSON.parse(localStorage.getItem('newsNotication') || '{}')
        setNewsNotication(newsNoticationJson)
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
                            value={isTradingPin ? tradingPin : currentPassword}
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
                            value={isTradingPin ? newTradingPin : newPassword}
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
                        <input className="form-check-input" type="checkbox" role="switch" id="news_admin"
                            checked={newsAdmin}
                            onChange={(event) => changeNewsAdmin(event.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="news_admin">Receive admin news</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="news_notication"
                            checked={newsNotication}
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