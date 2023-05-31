import { wsService } from "../../../services/websocket-service";
import * as sspb from "../../../models/proto/system_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import { useEffect } from 'react';
import { ACCOUNT_ID, SOCKET_CONNECTED, SOCKET_RECONNECTED } from '../../../constants/general.constant';
import SummaryTradingTable from './SummaryTradingTable'
import './orderPortfolio.scss'

function SummaryTrading() {

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendAccountPortfolio();;
            }
        });

        return () => {
            ws.unsubscribe();
        }
    }, [])

    const sendAccountPortfolio = () => {
        let accountId = sessionStorage.getItem(ACCOUNT_ID) || '';
        const systemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let accountPortfolioRequest = new systemServicePb.AccountPortfolioRequest();
            accountPortfolioRequest.addAccountId(Number(accountId));
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_PORTFOLIO_REQ);
            rpcMsg.setPayloadData(accountPortfolioRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const _renderSummaryTrading = () => (
        <div className="site-main">
            <div className="container">
                <div className="card shadow-sm mb-3">
                    <div className="card-header">
                        <h6 className="card-title fs-6 mb-0">Summary Trading</h6>
                    </div>
                    <div className="card-body">
                        <SummaryTradingTable />
                    </div>
                </div>
            </div>
        </div>
    )
    return (
        <>{_renderSummaryTrading()}</>
    )
}
export default SummaryTrading