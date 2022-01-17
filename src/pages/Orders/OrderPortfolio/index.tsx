import { wsService } from "../../../services/websocket-service";
import * as sspb from "../../../models/proto/system_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { OBJ_AUTHEN } from '../../../constants/general.constant';
import PortfolioTable from './PortfoioTable'
import './orderPortfolio.scss'

function OrderPortfolio() {
    const [accountPortfolio, setAccountPortfolio] = useState([]);

    useEffect(() => {
        const renderDataToScreen = wsService.getAccountPortfolio().subscribe(res => {
            console.log(16, res);
            
            setAccountPortfolio(res.orderList)
        });

        return () => renderDataToScreen.unsubscribe();
    }, [])

    useEffect(() => callWs(), []);

    const callWs = () => {
        setTimeout(() => {
            sendAccountPortfolio();
        }, 200)
    }

    const buildMessage = (accountId: string) => {
        const systemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let accountPortfolioRequest = new systemServicePb.AccountPortfolioRequest();
            accountPortfolioRequest.setAccountId(Number(accountId));
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_PORTFOLIO_REQ);
            rpcMsg.setPayloadData(accountPortfolioRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            console.log('send');
            
        }
    }

    const sendAccountPortfolio = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessage(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ?? '';
                buildMessage(accountId);
                return;
            }
        });
    }

    const _renderPortfolio = () => (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <div className="card-header">
                            <h6 className="card-title fs-6 mb-0">My Account</h6>
                        </div>
                        <div className="card-body">
                            <PortfolioTable accountPortfolio = {accountPortfolio}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
    return (
        <>{_renderPortfolio()}</>
    )
}
export default OrderPortfolio