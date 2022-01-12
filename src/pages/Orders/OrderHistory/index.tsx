import OrderSearch from '../../../components/Orders/OrderSearch'
import OrderTable from '../../../components/Orders/OrderTable'
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import queryString from 'query-string';
import { IParamHistorySearch } from '../../../interfaces/order.interface'

import { useEffect, useState } from "react";


const OrderHistory = () => {

    const [getDataOrderHistory, setgetDataOrderHistory] = useState([]);
    const [HistorySearch, setHistorySearch] = useState({})

    console.log(16, HistorySearch);
    

    const getDataFromOrderHistorySearch = (dataFromOrderHistorySearch: IParamHistorySearch) => {
        setHistorySearch(dataFromOrderHistorySearch)
    }

    useEffect(() => {
        const xxx = wsService.getListOrderHistory().subscribe(res => {
            setgetDataOrderHistory(res)
        });

        return () => xxx.unsubscribe();  
    }, [HistorySearch])

    useEffect(() => {
        callWs();
    }, []);

    const callWs = () => {
        setTimeout(() => {
            sendListOrder();
        }, 500)
    }

    const prepareMessagee = (accountId: string) => {
        const uid = accountId;
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();
            // orderHistoryRequest.setTicker(ticker)
            // orderHistoryRequest.setOrderType(orderType)
            // orderHistoryRequest.setFromDatetime()
            // orderHistoryRequest.setToDatetime()
            // orderHistoryRequest.setOrderState()

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
            rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());            
        }
    }

    const sendListOrder = () => {
        
    }
 
    // const getListData = () => {
    //     wsService.getListOrderHistory().subscribe(res => {
    //         setgetDataOrderHistory(res)
    //     });
    // }


    const _renderOrderHistory = () => {
        return (
            <div className='site'>
                <div className="site-main">
                    <div className="container">
                        <div className="card shadow-sm mb-3">
                            <OrderSearch getData = {getDataFromOrderHistorySearch} />
                            <OrderTable listOrderHistory = {getDataOrderHistory} />
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
