import { useEffect, useState } from 'react';
import './Login.scss';
import { ACCOUNT_ID, EXPIRE_TIME, KEY_LOCAL_STORAGE, POEM_ID, ROLE, SUB_ACCOUNTS, TIME_ZONE } from '../../../constants/general.constant';
import { LOGO } from '../../../assets';
import axios from 'axios';
import { IReqLogin } from '../../../interfaces';
import { success } from '../../../constants';
import { API_LOGIN } from '../../../constants/api.constant';

const api_url = process.env.REACT_APP_API_URL;

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRemeber, setIsRemeber] = useState(false)
    const [isMessErr, setIsMessErr] = useState(false);

    const handleEmail = (value: string) => {
        setEmail(value);
    }

    const handlePassword = (value: string) => {
        setPassword(value);
    }

    const handleRemember = (checked: boolean) => {
        setIsRemeber(checked)
    }

    const requestLogin = () => {
        const url = `${api_url}${API_LOGIN}`;
        const param = {
            poem_id: email.trim(),
            password: password.trim(),
            account_type: 'lp'
        }

        return axios.post<IReqLogin, IReqLogin>(url, param).then((resp) => {
            if (resp.status === success) {
                if (resp.data.data) {
                    localStorage.setItem(ACCOUNT_ID, resp.data.data.account_id.toString());
                    localStorage.setItem(KEY_LOCAL_STORAGE.AUTHEN, resp.data.data.access_token.toString());
                    localStorage.setItem(EXPIRE_TIME, resp.data.data.expire_time);
                    localStorage.setItem(ROLE, resp.data.data.role);
                    localStorage.setItem(POEM_ID, resp.data.data.poem_id);
                    if (resp.data.data.sub_accounts) {
                        localStorage.setItem(SUB_ACCOUNTS, JSON.stringify(resp.data.data.sub_accounts));
                    } else {
                        localStorage.removeItem(SUB_ACCOUNTS);
                    }
                    window.location.href = '/';
                }
            }
        },
            (error) => {
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
                            <h3 className="text-center text-primary mb-3"><img src={LOGO} alt="" style={{ maxHeight: "7rem" }} /></h3>
                            <div className="card card-login shadow">
                                <div className="card-body">
                                    <h4 className="text-primary-custom">Login</h4>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">AccountNo</label>
                                        <div className="input-group">
                                            <input type="text" className="form-control border-end-0" value={email} onChange={(event) => handleEmail(event.target.value)} />
                                            <span className="input-group-text bg-transparent"><i className="bi bi-person-fill opacity-50"></i></span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">Password</label>
                                        <div className="input-group">
                                            <input type="password" name="password" className="form-control border-end-0" value={password}
                                                onChange={(event) => handlePassword(event.target.value)}
                                            />
                                            <span className="input-group-text bg-transparent"><i className="bi bi-lock-fill opacity-50"></i></span>
                                        </div>
                                    </div>
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
                                        <p className="text-center"><a href="#">Forgot Password</a></p>
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