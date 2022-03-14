import { wsService } from "../../../services/websocket-service";
import * as sspb from "../../../models/proto/system_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { useEffect } from 'react';
import { ACCOUNT_ID, SOCKET_CONNECTED } from '../../../constants/general.constant';
import PortfolioTable from './PortfoioTable'
import './orderPortfolio.scss'

function OrderPortfolio() {

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendAccountPortfolio();;
            }
        });

        return () => {
            ws.unsubscribe();
        }
    }, [])

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
        }
    }

    const sendAccountPortfolio = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessage(accountId);
    }

    const _renderPortfolio = () => (
        <div className="site">
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <div className="card-header">
                            <h6 className="card-title fs-6 mb-0">Summary Trading</h6>
                        </div>
                        <div className="card-body">
                            <PortfolioTable/>
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