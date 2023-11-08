import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { success } from '../../../constants';
import { API_FORGOT_PASSWORD } from '../../../constants/api.constant';
import { MESSAGE_ERROR_API } from '../../../constants/message.constant';

import '../Login/Login.scss';

const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [accountId, setAccountId] = useState('');
    const [isSuspendAccount, setIsSuspendAccount] = useState(false);

    const apiUrl = `${window.globalThis.apiUrl}${API_FORGOT_PASSWORD}`;

    const disabledSubmitButton = () => {
        return email.trim() === '' || accountId.trim() === '';
    }

    useEffect(() => {
        setIsSuspendAccount(false);
    }, [email, accountId])

    const handleForgotPassword = () => {
        const param = {
            email: email,
            account_id: accountId
        }
        axios.post(apiUrl, param).then(resp => {
            if (resp?.data?.meta?.code === success) {
                const messageSuccess = resp?.data?.meta?.message ? resp?.data?.meta?.message : 'Update password successfully';
                toast.success(messageSuccess);
                setAccountId('');
                setEmail('');
            } else {
                const messageError = resp?.data?.meta?.message ? resp?.data?.meta?.message : 'Update password faild';
                toast.error(messageError);
            }
        }).catch(error => {
            const typeError = error?.response?.data?.data;
            if(typeError === MESSAGE_ERROR_API.ERROR_SUSPEND_ACCOUNT){
                setIsSuspendAccount(true);
            }else{
                toast.error(typeError);
            }
        })
    }

    const _renderNotiAccSuspend = () => (
        <div className='fz-14 text-danger '>
            <p className='m-0'>This account has been suspended. </p>
            <p className='m-0'>Please contact the hosting provider for more information:</p>
            <p className='m-0'>Phillip SG Contact (English Speaking): +65 6212-1810</p>
            <p className=''>Phillip SG Email: cddesk@phillip.com.sg</p>
        </div>  
    )

    const _renderForgotPasswordTemplate = () => (
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
                                    <h4 className="text-primary-custom">Forgot Password</h4>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">Email</label>
                                        <div className="input-group">
                                            <input type='text' className="form-control" value={email}
                                             onChange={(event) => setEmail(event.target.value)} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">Account ID</label>
                                        <div className="input-group">
                                            <input type='text' className="form-control" value={accountId}
                                             onChange={(event) => setAccountId(event.target.value)} />
                                        </div>
                                    </div>
                                    
                                    {isSuspendAccount && _renderNotiAccSuspend()}
                                    <div className="mt-1 d-flex justify-content-center">
                                        <div className='d-flex'>
                                            <button disabled={disabledSubmitButton()} style={{marginRight: '10px'}}
                                            onClick={handleForgotPassword}
                                            className="btn btn-primary pt-2 pb-2 text-white d-block text-uppercase  mb-2">
                                                <strong>Submit</strong>
                                            </button>
                                            <button onClick={() => {
                                                window.location.href = `${process.env.PUBLIC_URL}/login`
                                            }}
                                            className="btn btn-primary pt-2 pb-2 text-white d-block text-uppercase  mb-2">
                                                <strong>Cancel</strong>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderForgotPasswordTemplate()}</>
}

export default ForgotPassword