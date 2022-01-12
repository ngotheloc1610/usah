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

    const [HistorySearch, setHistorySearch] = useState({
            ticker: '',
            orderStatus: '',
            orderSideSell: false,
            orderSideBuy: false,
            dateTimeFrom: '',
            dateTimeTo: '',
        })

    const {ticker, orderStatus, orderSideSell, orderSideBuy, dateTimeFrom, dateTimeTo} = HistorySearch

    
    

    const getDataFromOrderHistorySearch = (dataFromOrderHistorySearch: IParamHistorySearch) => {
        setHistorySearch(dataFromOrderHistorySearch)
    }

    const getParamOrderSide = () => {
        if (orderSideSell === true && orderSideBuy === false) {
            return 1
        }
        else if (orderSideSell === false && orderSideBuy === true) {
            return 2
        }
        else{
            return 0
        }
    }
    console.log(16, HistorySearch);
    useEffect(() => {
        const renderDataToScreen = wsService.getListOrderHistory().subscribe(res => {
            console.log(49, res);            
            setgetDataOrderHistory(res)
        });

        return () => renderDataToScreen.unsubscribe();  
    }, [HistorySearch] )

    useEffect(() => callWs(), []);

    const callWs = () => {
        setTimeout(() => {
            prepareMessagee();
        }, 500)
    }

    const prepareMessagee = () => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();
            orderHistoryRequest.setTicker(ticker)
            orderHistoryRequest.setOrderType(orderStatus)
            orderHistoryRequest.setFromDatetime(dateTimeFrom)
            orderHistoryRequest.setToDatetime(dateTimeTo)
            orderHistoryRequest.setOrderState(getParamOrderSide())

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
            rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());               
        }
    }
 
    const _renderOrderHistory = () => {
        return (
            <div className='site'>
                <div className="site-main">
                    <div className="container">
                        <div className="card shadow-sm mb-3">
                            <OrderSearch getDataFromOrderHistorySearch = { getDataFromOrderHistorySearch } />
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
