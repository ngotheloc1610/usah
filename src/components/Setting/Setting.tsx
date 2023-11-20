import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios';

import { defindConfigPost, validationPassword } from '../../helper/utils'
import { ERROR_MSG_VALIDATE, MESSAGE_TOAST, MAX_LENGTH_PASSWORD, LENGTH_PASSWORD } from '../../constants/general.constant'
import { API_POST_CHANGE_PASSWORD } from '../../constants/api.constant';
import { IReqChangePassword } from '../../interfaces';
import { errorPastPassword, success } from '../../constants';

interface ISetting {
    isChangePassword: boolean;
}

const defaultProps = {
    isChangePassword: false,
}

const Setting = (props: ISetting) => {
    const api_url = window.globalThis.apiUrl;
    const urlPostChangePassword = `${api_url}${API_POST_CHANGE_PASSWORD}`;

    const { isChangePassword } = props
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isOpenEye, setIsOpenEye] = useState(true)
    const [isOpenEyeNew, setIsOpenEyeNew] = useState(true)
    const [isOpenEyeConfirm, setIsOpenEyeConfirm] = useState(true)
    const [checkPass, setCheckPass] = useState(false)
    const [checkNewPass, setCheckNewPass] = useState(false)
    const [checkConfirm, setCheckConfirm] = useState(false)


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

    const _renderMsgError = () => (
        <>
            New password must contain:
            <ul>
                <li> 8 - 20 character </li>
                <li> at least one upper case letter (A, B, C...) </li>
                <li> at least one lower case letter (a, b, c...) </li>
                <li> at least one number </li>
            </ul>
        </>
    )

    const handleSubmit = () => {
        setCheckPass(password === newPassword);
        setCheckNewPass(!validationPassword(newPassword));
        validationPassword(newPassword) && setCheckConfirm(newPassword !== confirmPassword);
        if (password !== newPassword && validationPassword(newPassword) && newPassword === confirmPassword) {
            handleChangePassword();
        }
    }

    const handleChangePassword = () => {
        const param = {
            password: password,
            newPassword: newPassword
        };
        axios.post<IReqChangePassword, IReqChangePassword>(urlPostChangePassword, param, defindConfigPost()).then((resp) => {
            if (resp?.data?.meta?.code === success) {
                toast.success(MESSAGE_TOAST.SUCCESS_PASSWORD_UPDATE);
                setPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setCheckConfirm(false);
            } else {
                toast.error(MESSAGE_TOAST.ERROR_PASSWORD_UPDATE);
            }
        }, (error) => {
            const code = error.response.data.meta?.code;
            if (code === errorPastPassword) {
                toast.error(MESSAGE_TOAST.ERROR_PASSWORD_SHOULD_DIFF);
            } else {
                toast.error(MESSAGE_TOAST.ERROR_PASSWORD_UPDATE);
            }  
        });
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
                        {isChangePassword && checkPass ? ERROR_MSG_VALIDATE.DUPPLICATE_PASSWORD : ''}
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

                <div className="row mb-3 align-items-center">
                    <div className="col-md-3  mb-1 mb-md-0"></div>
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div>
                            {checkConfirm && <label className='ms-2 new-password'>Passwords don’t match.</label>}
                        </div>
                    </div>
                </div>            
            </div>
        </>
    )

    const disabledButton = () => {
        return password === '' || newPassword === '' || confirmPassword === '';
    }

    const _renderSettingTemplate = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <h4 className="border-bottom pb-1 mb-3"><i className="bi bi-gear-fill opacity-50"></i> <strong>Setting</strong></h4>
                <h6 className="c-title mb-3">Change Password</h6>
                <div className="mb-4 trading-pin-form">
                    {_renderChanngePassword()}
                    {_renderNewPassword()}
                    {_renderConfirmPassword()}
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3">
                            &nbsp;
                        </div>
                        <div className="col-md-4">
                            <button disabled={disabledButton()} className="btn btn-primary px-4" onClick={handleSubmit}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>
        {isChangePassword && _renderSettingTemplate()}
    </>
}

Setting.defaultProps = defaultProps

export default Setting