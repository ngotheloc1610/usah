import { useEffect, useState } from 'react';
import { wsService } from '../../../services/websocket-service';
import * as sspb from '../../../models/proto/system_service_pb';
import * as rpc from '../../../models/proto/rpc_pb';
import './Login.scss';
import ReduxPersist from '../../../config/ReduxPersist';
import { KEY_LOCAL_STORAGE } from '../../../constants/general.constant';
import { LOGO_ICON } from '../../../assets';

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRemeber, setIsRemeber] = useState(false)
    useEffect(() => {
        const loginRes = wsService.getLoginResponse().subscribe(resp => {
            console.log('login response:', resp)
        });
        return () => loginRes.unsubscribe();
    }, [])

    const handleEmail = (value: string) => {
        setEmail(value);
    }

    const handlePassword = (value: string) => {
        setPassword(value);
    }

    const handleRemember = (checked: boolean) => {
        setIsRemeber(checked)
    }

    const sendMessageReq = () => {
        let systemServicePb: any = sspb;
        let rProtoBuff: any = rpc;
        const currentDate = new Date();
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            const login = new systemServicePb.LoginRequest();
            login.setLogin(email);
            login.setPassword(password);
            login.setMacAddress('');
            login.setLocalIp('');

            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.AUTHEN_REQ);
            rpcMsg.setPayloadData(login.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }

        // TODO: HASH TOKEN WHEN WAITING API LOGIN
        const objAuthen = {
            access_token: process.env.REACT_APP_TOKEN,
            account_id: process.env.REACT_APP_TRADING_ID
        }
        ReduxPersist.storeConfig.storage.setItem(KEY_LOCAL_STORAGE.AUTHEN, JSON.stringify(objAuthen));
        window.location.href = './dashboard'
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
        if (email !== '' && password !== ''){
            sendMessageReq()
        }
    }

    const handlekeyDown = (event: any) => {
        if (email !== '' && password !== '') {
            if (event.key === 'Enter') {
                sendMessageReq()
            }
        }
    }

    const _renderLoginTemplate = () => (
        <div className="h-full page login" onKeyDown={handlekeyDown}>
            <div className="h-full site-main d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-4">
                            <h3 className="text-center text-primary mb-3"><img src={LOGO_ICON.default} alt="" /></h3>
                            <div className="card card-login shadow">
                                <div className="card-body">
                                    <h4 className="text-primary-custom">Login</h4>
                                    <div className="mb-3">
                                        <label className="d-block mb-1 text-secondary">Email</label>
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