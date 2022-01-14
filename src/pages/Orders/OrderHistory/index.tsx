import OrderHistorySearch from '../../../components/Orders/OrderSearch'
import OrderTable from '../../../components/Orders/OrderTable'
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import { IParamHistorySearch } from '../../../interfaces/order.interface'
import { useEffect, useState } from 'react';
import { KEY_LOCAL_STORAGE } from '../../../constants/general.constant';

const OrderHistory = () => {

    const [getDataOrderHistory, setgetDataOrderHistory] = useState([]);

    useEffect(() => {
        const renderDataToScreen = wsService.getListOrderHistory().subscribe(res => {   
            setgetDataOrderHistory(res.orderList)
        });

        return () => renderDataToScreen.unsubscribe();  
    }, [])

    useEffect(() => callWs(), []);

    const callWs = () => {
        setTimeout(() => {
            sendListOrder();
        }, 500)
    }

    const prepareMessagee = (accountId: string ) => {
        const uid = accountId;
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();           
            orderHistoryRequest.setAccoundId(uid);
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
            rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());  
        }
    }

    const sendListOrder = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '' ;
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(KEY_LOCAL_STORAGE.AUTHEN, JSON.stringify(objAuthen).toString());
                prepareMessagee(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(KEY_LOCAL_STORAGE.AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                prepareMessagee(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                prepareMessagee(accountId);
                return;
            }
        });
    }
 
    const _renderOrderHistory = () => {
        return (
            <div className='site'>
                <div className="site-main">
                    <div className="container">
                        <div className="card shadow-sm mb-3">
                            <OrderHistorySearch  />
                            <OrderTable listOrderHistory = { getDataOrderHistory } />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            {_renderOrderHistory()}
        </div>
    )
}
export default OrderHistory
