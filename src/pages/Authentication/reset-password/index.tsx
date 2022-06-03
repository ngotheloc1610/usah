import './ResetPassword.scss';
import '../Login/Login.scss';
import { useState } from 'react';
import { API_RESET_PASSWORD } from '../../../constants/api.constant';
import axios from 'axios';
import { LENGTH_PASSWORD, MAX_LENGTH_PASSWORD } from '../../../constants/general.constant';
import { validationPassword } from '../../../helper/utils';
import queryString from 'query-string';
import { success, unAuthorised } from '../../../constants';
import { toast } from 'react-toastify';

const ResetPassword = () => {

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isNotMatch, setIsNotMatch] = useState(false);
    const [checkNewPass, setCheckNewPass] = useState(false);
    const [isOpenEyeNew, setIsOpenEyeNew] = useState(true);
    const [isOpenEyeConfirm, setIsOpenEyeConfirm] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errMess, setErrMess] = useState('');
    const [isExpiredResetToken, setIsExpiredResetToken] = useState(false);

    const apiUrl = `${process.env.REACT_APP_API_URL}${API_RESET_PASSWORD}`;
    const paramStr = window.location.search;
    const queryParam = queryString.parse(paramStr);

    const handleSubmit = () => {
        setIsNotMatch(newPassword !== confirmPassword);
        if (newPassword !== confirmPassword) {
            return;
        }
        setCheckNewPass(!validationPassword(newPassword));

        if (validationPassword(newPassword) && newPassword === confirmPassword) {
            handleResetPassword();
        }
    }

    const handleResetPassword = () => {
        const param = {
            new_password: newPassword,
            reset_token: queryParam?.reset_token
        }
        axios.post(apiUrl, param).then(resp => {
            switch (resp?.data?.meta?.code) {
                case success: {
                    setIsError(false);
                    setIsExpiredResetToken(false);
                    window.location.href = `${process.env.PUBLIC_URL}/login`;
                    break;
                }
                case unAuthorised: {
                    setIsError(false);
                    setIsExpiredResetToken(true);
                    break;
                }
                default: {
                    setIsError(true);
                    setIsExpiredResetToken(false);
                    setErrMess(resp?.data?.meta?.message);
                    break;
                }
            }
        }).catch((error: any) => {
            toast.error(error.response.data.data)
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

    const _renderMsgError = () => (
        <>
            New password must contain:
            <ul>
                <li> from 8-20 character </li>
                <li> at least one uppercase letter </li>
                <li> at least one number </li>
            </ul>
        </>
    )

    const _renderResetTokenErrorMessage = () => (
        <>
        <span>Your password reset link is expired. Please email/contact support to receive the set password email again.
        </span>
        <br />
        <span>Phillip SG Contact(English Speaking): +65 6212-1810</span>
        <br />
        <span>Phillip SG Email: <span className='link-custom'>cddesk@phillip.com.sg</span></span>
        </>
    )

    const _renderResetPasswordTemplate = () => (
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
                                    <h4 className="text-primary-custom">Reset Password</h4>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">New Password</label>
                                        <div className="input-group">
                                            <input type={isOpenEyeNew ? 'password' : 'text'} className="form-control border-end-0" value={newPassword} onChange={handleNewPassword}
                                                minLength={LENGTH_PASSWORD}
                                                maxLength={MAX_LENGTH_PASSWORD}
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
                                            <input type={isOpenEyeConfirm ? 'password' : 'text'} name="password" className="form-control border-end-0" value={confirmPassword} onChange={handleConfirmPassword} />
                                            <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" 
                                                onClick={() => setIsOpenEyeConfirm(!isOpenEyeConfirm)} >
                                                <i className={`bi ${isOpenEyeConfirm ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12`} />
                                            </button>
                                        </div>
                                        {isNotMatch && <span className='text-danger'>Confirm Passworn don't match</span>}
                                        {isError && <span className='text-danger'>{errMess}</span>}
                                        {isExpiredResetToken && <div className='text-danger'>{_renderResetTokenErrorMessage()}</div>}
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
        {_renderResetPasswordTemplate()}
    </>
}

export default ResetPassword