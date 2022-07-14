import { useEffect, useState } from 'react';
import './Login.scss';
import { ACCOUNT_ID, EXPIRE_TIME, IS_REMEMBER_ME, KEY_LOCAL_STORAGE, MAX_ORDER_VOLUME, MIN_ORDER_VALUE, POEM_ID, REMEMBER_KEY, ROLE, SECRET_KEY, SUB_ACCOUNTS } from '../../../constants/general.constant';
import { LOGO } from '../../../assets';
import axios from 'axios';
import { IReqLogin } from '../../../interfaces';
import { MULTIPLE_LOGIN_FAIL, success } from '../../../constants';
import { API_LOGIN } from '../../../constants/api.constant';
import { getRandomNumbers } from '../../../helper/utils';
import { useDispatch, useSelector } from 'react-redux';
import { setRememberKey, setSecretKey } from '../../../redux/actions/auth';

const api_url = window.globalThis.apiUrl;

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRemeber, setIsRemeber] = useState(false)
    const [isMessErr, setIsMessErr] = useState(false);
    const [isHiddenPassword, setIsHiddenPassword] = useState(true);
    const [isMultiLoginFail, setIsMultiLoginFail] = useState(false);
    const secretKey = useSelector((state: any) => state.auth.secretKey);
    const rememberKey = useSelector((state: any) => state.auth.rememberKey);
    const isRememberMe = localStorage.getItem(IS_REMEMBER_ME);
    const cryptoJS = require("crypto-js");
    const dispatch = useDispatch();

    useEffect(() => {
        setIsRemeber(isRememberMe === 'true');
        if (isRememberMe && isRememberMe === 'true') {
            if (rememberKey && secretKey) {
                const bytes = cryptoJS.AES.decrypt(rememberKey, secretKey);
                if (bytes.toString(cryptoJS.enc.Utf8)) {
                    const decryptedData = JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
                    if (decryptedData) {
                        setEmail(decryptedData.account_id);
                        setPassword(decryptedData.password);
                    }
                }
            }
        }
    }, [])

    const handleEmail = (value: string) => {
        setEmail(value);
    }

    const handlePassword = (value: string) => {
        setPassword(value);
    }

    const handleRemember = (checked: boolean) => {
        localStorage.setItem(IS_REMEMBER_ME, JSON.stringify(checked));
        setIsRemeber(checked)
    }

    const _renderMsgSuspend = () => (
        <div className='fz-14 text-danger '>
            <p className='m-0'>This account has been suspended. </p>
            <p className='m-0'>Please contact the hosting provider for more information:</p>
            <p className='m-0'>Phillip SG Contact (English Speaking): +65 6212-1810</p>
            <p className=''>Phillip SG Email: cddesk@phillip.com.sg</p>
        </div>
    )

    const requestLogin = () => {
        const url = `${api_url}${API_LOGIN}`;
        const param = {
            account_id: email.trim(),
            password: password.trim(),
        }
        const secretKey = getRandomNumbers();
        dispatch(setSecretKey(secretKey));

        var encrypt = cryptoJS.AES.encrypt(JSON.stringify(param), secretKey).toString();
        if (encrypt) {
            dispatch(setRememberKey(encrypt));
        }
        return axios.post<IReqLogin, IReqLogin>(url, param)
        .then((resp) => {
            if (resp.status === success) {
                if (resp?.data?.data) {
                    setIsMultiLoginFail(false);
                    const data = resp.data.data;
                    localStorage.setItem(ACCOUNT_ID, data.account_id.toString());
                    localStorage.setItem(KEY_LOCAL_STORAGE.AUTHEN, data.access_token.toString());
                    localStorage.setItem(EXPIRE_TIME, data.expire_time);
                    localStorage.setItem(ROLE, data.role);
                    localStorage.setItem(POEM_ID, data.poem_id);
                    localStorage.setItem(MIN_ORDER_VALUE, resp.data.data.min_order_value.toString());
                    localStorage.setItem(MAX_ORDER_VOLUME, resp.data.data.max_order_volume.toString());
                    if (data.sub_accounts) {
                        localStorage.setItem(SUB_ACCOUNTS, JSON.stringify(data.sub_accounts));
                    } else {
                        localStorage.removeItem(SUB_ACCOUNTS);
                    }
                    window.location.href = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '/';
                }
            }
        },
            (error) => {
                if (error.response.data.meta.code === MULTIPLE_LOGIN_FAIL) {
                    setIsMultiLoginFail(true);
                    return
                }
                setIsMessErr(true);
            });
    }
    useEffect(() => unLogin(), [email, password])

    const unLogin = () => {
        const el: any = document.querySelector('.btn-login')
        if (email !== '' && password !== '') {
            el?.classList.remove('unclick')
        } else {
            el?.classList.add('unclick')
        }
    }

    const handleSubmit = () => {
        if (email !== '' && password !== '') {
            setIsMessErr(false);
            requestLogin();
        }


    }

    const handlekeyDown = (event: any) => {
        if (email !== '' && password !== '') {
            if (event.key === 'Enter') {
                setIsMessErr(false);
                requestLogin();
            }
        }
    }

    const _renderLoginTemplate = () => (
        <div className="h-full page login" onKeyDown={handlekeyDown}>
            <div className="h-full site-main d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-4">
                            {/* <h3 className="text-center text-primary mb-3"><img src={LOGO} alt="" style={{ maxHeight: "7rem" }} /></h3> */}
                            <h3 className="text-center text-primary mb-3 fs-px-30">
                                <strong className="text-center logo-style">
                                    <span>US Market Trading</span>
                                    <span>(Asian Hrs)</span>
                                </strong>
                            </h3>
                            <div className="card card-login shadow">
                                <div className="card-body">
                                    <h4 className="text-primary-custom">Login</h4>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">AccountNo</label>
                                        <div className="input-group">
                                            <input type="text" className="form-control" value={email} onChange={(event) => handleEmail(event.target.value)} />
                                            <span className="input-group-text bg-transparent"><i className="bi bi-person-fill opacity-50"></i></span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">Password</label>
                                        <div className="input-group">
                                            <input type={isHiddenPassword ? 'password' : 'text'} name="password" className="form-control border-end-0" value={password}
                                                onChange={(event) => handlePassword(event.target.value)}
                                            />
                                            <button className="btn btn-outline-secondary btn-pw-toggle no-pad" type="button" 
                                                onClick={() => setIsHiddenPassword(!isHiddenPassword)} >
                                                <i className={`bi ${isHiddenPassword ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12`} />
                                            </button>
                                        </div>
                                    </div>
                                    {isMultiLoginFail && _renderMsgSuspend()}
                                    {isMessErr && <div className='mb-3'>
                                        <label className="d-block mb-1 text-danger">Login ID and Password is NOT matching</label>
                                    </div>}
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" name="remember" checked={isRemeber}
                                                onChange={(event) => handleRemember(event.target.checked)} id="remember"
                                            />
                                            <label className="form-check-label" htmlFor="remember">
                                                Remember me
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-1">
                                        <a className="btn btn-primary pt-2 pb-2 text-white d-block text-uppercase btn-login mb-2 unclick" onClick={handleSubmit}><strong>Login</strong></a>
                                        <p className="text-center"><a href={`${process.env.PUBLIC_URL}/forgot-password`}>Forgot Password</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderLoginTemplate()}</>
}

export default Login