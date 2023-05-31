import { wsService } from "../services/websocket-service";
import * as qspb from '../models/proto/query_service_pb'
import * as rspb from "../models/proto/rpc_pb";
import { ACCOUNT_ID } from '../constants/general.constant';

function sendMsgSymbolList() {

    const buildMessage = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let symbolListRequest = new queryServicePb.SymbolListRequest();
            symbolListRequest.setAccountId(Number(accountId));

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.SYMBOL_LIST_REQ);
            rpcMsg.setPayloadData(symbolListRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMessageSymbolList = () => {
        let accountId = sessionStorage.getItem(ACCOUNT_ID) || '';
        buildMessage(accountId);
    }

    return sendMessageSymbolList()
}

export default sendMsgSymbolList