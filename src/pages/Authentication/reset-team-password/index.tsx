import { useEffect, useState } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import { toast } from 'react-toastify';

import { API_RESET_TEAM_PASSWORD } from '../../../constants/api.constant';
import { RETURN_LOGIN_TIME, LENGTH_PASSWORD, MAX_LENGTH_PASSWORD, NOT_MATCH_PASSWORD, MESSAGE_TOAST, KEY_LOCAL_STORAGE } from '../../../constants/general.constant';
import { validationPassword } from '../../../helper/utils';
import { errorPastPassword, RESET_PASSWORD_SUCCESS, success, unAuthorised } from '../../../constants';
import { _renderMsgError, _renderResetTokenErrorMessage } from '../../../helper/utils-ui';

import './ResetTeamPassword.scss';

const ResetTeamPassword = () => {

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isNotMatch, setIsNotMatch] = useState(false);
    const [checkNewPass, setCheckNewPass] = useState(false);
    const [isOpenEyeNew, setIsOpenEyeNew] = useState(true);
    const [isOpenEyeConfirm, setIsOpenEyeConfirm] = useState(true);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errMess, setErrMess] = useState('');
    const [isExpiredResetToken, setIsExpiredResetToken] = useState(false);
    const [countDown, setCountDown] = useState(RETURN_LOGIN_TIME);
    
    const apiUrl = `${window.globalThis.apiUrl}${API_RESET_TEAM_PASSWORD}`;
    const paramStr = window.location.search;
    const queryParam = queryString.parse(paramStr);
    
    useEffect(() => {
        if (isSuccess) {
            if (countDown === 0) {
                window.location.href = `${process.env.PUBLIC_URL}`;
            }
            const intervalId = setInterval(() => {
                setCountDown(countDown - 1);
            }, 1000);
            sessionStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
            localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
            return () => clearInterval(intervalId);
        }
    }, [isSuccess, countDown]);

    const handleSubmit = () => {
        setIsNotMatch(newPassword !== confirmPassword);
        if (newPassword !== confirmPassword) {
            return;
        }
        setCheckNewPass(!validationPassword(newPassword));

        if (validationPassword(newPassword) && newPassword === confirmPassword) {
            handleResetTeamPassword();
        }
    }

    const renderSuccessMessage = () => (
        
        <>
            <div className='text-success d-inline'>Password is updated and you can now use your new password to sign in </div>
            <a href={`${window.location.origin}${process.env.PUBLIC_URL}`}>{`${window.location.origin}${process.env.PUBLIC_URL}`}</a>.
            <div className='text-success mt-3'>You will be redirected to LP Web Trading in <strong>{countDown}</strong> seconds.</div>
        </>
    )

    const handleResetTeamPassword = () => {
        const param = {
            new_password: newPassword,
            reset_token: queryParam.reset_token
        }
        axios.post(apiUrl, param).then(resp => {
            switch (resp?.data?.meta?.code) {
                case success: {
                    setIsError(false);
                    setIsExpiredResetToken(false);
                    setIsSuccess(true);
                    toast.success(RESET_PASSWORD_SUCCESS);
                    break;
                }
                case unAuthorised: {
                    setIsError(false);
                    setIsSuccess(false);
                    setIsExpiredResetToken(true);
                    break;
                }
                default: {
                    setIsError(true);
                    setIsExpiredResetToken(false);
                    setIsSuccess(false);
                    setErrMess(resp?.data?.meta?.message);
                    break;
                }
            }
        }).catch((error: any) => {
            if (error.response.data?.meta?.code === unAuthorised) {
                setIsError(false);
                setIsSuccess(false);
                setIsExpiredResetToken(true);
                return;
            }
            if (error.response.data?.meta.code === errorPastPassword){
                toast.error(MESSAGE_TOAST.ERROR_PASSWORD_SHOULD_DIFF)
            }
        })
    }

    const disableButton = () => {
        return newPassword === '' || confirmPassword === '';
    }

    const handleNewPassword = (event: any) => {
        setNewPassword(event.target.value);
    }

    const handleConfirmPassword = (event: any) => {
        setConfirmPassword(event.target.value);
    }

    const _renderResetTeamPasswordTemplate = () => (
        <div className="h-full page login">
            <div className="h-full site-main d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-4">
                            <h3 className="text-center text-primary mb-3 fs-px-30">
                                <strong className="text-center logo-style">
                                    <span>US Market Trading</span>
                                    <span>(Asian Hrs)</span>
                                </strong>
                            </h3>
                            <div className="card card-login shadow">
                                <div className="card-body">
                                    <h4 className="text-primary-custom">Reset Team Password</h4>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">New Password</label>
                                        <div className="input-group">
                                            <input type={isOpenEyeNew ? 'password' : 'text'} className="form-control border-end-0" value={newPassword} onChange={handleNewPassword}
                                                minLength={LENGTH_PASSWORD} maxLength={MAX_LENGTH_PASSWORD}
                                            />
                                            <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button"
                                                onClick={() => setIsOpenEyeNew(!isOpenEyeNew)} >
                                                <i className={`bi ${isOpenEyeNew ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">Confirm Password</label>
                                        <div className="input-group">
                                            <input type={isOpenEyeConfirm ? 'password' : 'text'} name="password" className="form-control border-end-0" value={confirmPassword}
                                                onChange={handleConfirmPassword} minLength={LENGTH_PASSWORD} maxLength={MAX_LENGTH_PASSWORD} />
                                            <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button"
                                                onClick={() => setIsOpenEyeConfirm(!isOpenEyeConfirm)} >
                                                <i className={`bi ${isOpenEyeConfirm ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12`} />
                                            </button>
                                        </div>
                                        {isNotMatch && <span className='text-danger'>{NOT_MATCH_PASSWORD}</span>}
                                        {isError && <span className='text-danger'>{errMess}</span>}
                                        {isExpiredResetToken && <div className='text-danger'>{_renderResetTokenErrorMessage()}</div>}
                                        {isSuccess && renderSuccessMessage()}
                                    </div>

                                    <div className="row mb-3 align-items-center">
                                        <div className='new-password'>
                                            {checkNewPass ? _renderMsgError() : ''}
                                        </div>
                                    </div>

                                    <div className="mt-1">
                                        <button className="btn btn-primary pt-2 pb-2 text-white d-block text-uppercase margin-auto mb-2 w-100" disabled={disableButton()}
                                            onClick={handleSubmit}>
                                            <strong>Reset</strong>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>
        {_renderResetTeamPasswordTemplate()}
    </>
}

export default ResetTeamPassword