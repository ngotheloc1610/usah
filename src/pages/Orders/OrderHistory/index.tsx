import OrderHistorySearch from '../../../components/Orders/OrderSearch'
import OrderTable from '../../../components/Orders/OrderTable'
import { wsService } from "../../../services/websocket-service";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import * as tmpb from "../../../models/proto/trading_model_pb";
import { useEffect, useState } from 'react';
import { ACCOUNT_ID, DEFAULT_ITEM_PER_PAGE, FORMAT_DATE, FROM_DATE_TIME, SOCKET_CONNECTED, SOCKET_RECONNECTED, START_PAGE, TO_DATE_TIME } from '../../../constants/general.constant';
import { IParamHistorySearch, IParamOrderHistory } from '../../../interfaces';
import moment from 'moment';
import { convertDatetoTimeStamp, defindConfigGet } from '../../../helper/utils';
import { API_GET_ORDER_HISTORY } from '../../../constants/api.constant';
import axios from 'axios';
import { success } from '../../../constants';
import { IDataOrderHistory, IReqOrderHistory } from '../../../interfaces/order.interface';
import { DATA_ORDER_HISTORY } from '../../../mocks';

const OrderHistory = () => {
    const tradingModel: any = tmpb;
    const api_url = window.globalThis.apiUrl;
    const currentDate = moment().format(FORMAT_DATE);
    // const [listOrderHistory, setListOrderHistory] = useState([]);
    const [listOrderHistory, setListOrderHistory] = useState<IDataOrderHistory[]>(DATA_ORDER_HISTORY);
    // const [paramHistorySearch, setParamHistorySearch] = useState<IParamHistorySearch>({
    //     symbolCode: '',
    //     orderState: 0,
    //     orderSide: 0,
    //     fromDate: convertDatetoTimeStamp(currentDate, FROM_DATE_TIME),
    //     toDate: convertDatetoTimeStamp(currentDate, TO_DATE_TIME),
    //     orderType: tradingModel.OrderType.OP_NONE
    // });

    const [paramHistorySearch, setParamHistorySearch] = useState<IParamOrderHistory>({
        page: START_PAGE,
        pageSize: DEFAULT_ITEM_PER_PAGE,
        symbolCode: '',
        orderState: 0,
        orderSide: 0,
        fromDate: convertDatetoTimeStamp(currentDate, FROM_DATE_TIME),
        toDate: convertDatetoTimeStamp(currentDate, TO_DATE_TIME),
        orderType: tradingModel.OrderType.OP_NONE
    });

    const [isDownload, setIsDownLoad] = useState(false);

    const urlGetOrderHistory = `${api_url}${API_GET_ORDER_HISTORY}`;

    const getDataOrderHistory = (params : IParamOrderHistory) => {
        axios.get<IReqOrderHistory, IReqOrderHistory>(urlGetOrderHistory, defindConfigGet(params)).then((resp) => {
            if (resp.status === success) {
                console.log(resp.data);
            }
        },
        (error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        getDataOrderHistory(paramHistorySearch);
    }, [paramHistorySearch])

    // useEffect(() => {
    //     const ws = wsService.getSocketSubject().subscribe(resp => {
    //         if (resp === SOCKET_CONNECTED) {
    //             sendListOrder(paramHistorySearch.fromDate, paramHistorySearch.toDate);
    //         }
    //     });

    //     const renderDataToScreen = wsService.getListOrderHistory().subscribe(res => {
    //         setListOrderHistory(res.orderList)
    //     });

    //     return () => {
    //         ws.unsubscribe();
    //         renderDataToScreen.unsubscribe();
    //     }
    // }, [])

    // const sendListOrder = (timeFrom: number, timeTo: number) => {
    //     let accountId = localStorage.getItem(ACCOUNT_ID) || '';
    //     const queryServicePb: any = qspb;
    //     let wsConnected = wsService.getWsConnected();
    //     if (wsConnected) {
    //         let currentDate = new Date();
    //         let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();
    //         orderHistoryRequest.setAccountId(Number(accountId));
    //         orderHistoryRequest.setFromDatetime(timeFrom);
    //         orderHistoryRequest.setToDatetime(timeTo);
    //         const rpcModel: any = rspb;
    //         let rpcMsg = new rpcModel.RpcMessage();
    //         rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
    //         rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
    //         rpcMsg.setContextId(currentDate.getTime());
    //         wsService.sendMessage(rpcMsg.serializeBinary());
    //     }
    // }

    const handleSearch = (item: IParamHistorySearch) => {
        // setParamHistorySearch(item);
        const from = isNaN(item.fromDate) ? 0 : item.fromDate;
        const currentDate = moment().format(FORMAT_DATE);
        const to = isNaN(item.toDate) ? convertDatetoTimeStamp(currentDate, TO_DATE_TIME) : item.toDate;
        // sendListOrder(from, to);
    }

    const handleDownLoad = (value: boolean) => {
        setIsDownLoad(value);
    }

    const _renderOrderHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <OrderHistorySearch paramSearch={handleSearch} handleDownLoad={handleDownLoad}/>
                        <OrderTable
                            listOrderHistory={listOrderHistory}
                            paramHistorySearch={paramHistorySearch}
                            isDownLoad={isDownload}
                            resetFlagDownload={handleDownLoad} 
                            getDataOrderHistory={getDataOrderHistory}
                            setParamHistorySearch={setParamHistorySearch}
                        />
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