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
import { convertDatetoTimeStamp, defindConfigPost } from '../../../helper/utils';
import { API_GET_ORDER_HISTORY } from '../../../constants/api.constant';
import axios from 'axios';
import { success, unAuthorised } from '../../../constants';
import { IDataOrderHistory } from '../../../interfaces/order.interface';
import { toast } from 'react-toastify';

const OrderHistory = () => {
    const tradingModel: any = tmpb;
    const api_url = window.globalThis.apiUrl;
    const currentDate = moment().format(FORMAT_DATE);
    // const [listOrderHistory, setListOrderHistory] = useState([]);
    const [listOrderHistory, setListOrderHistory] = useState<IDataOrderHistory[]>([]);
    // const [paramHistorySearch, setParamHistorySearch] = useState<IParamHistorySearch>({
    //     symbolCode: '',
    //     orderState: 0,
    //     orderSide: 0,
    //     fromDate: convertDatetoTimeStamp(currentDate, FROM_DATE_TIME),
    //     toDate: convertDatetoTimeStamp(currentDate, TO_DATE_TIME),
    //     orderType: tradingModel.OrderType.OP_NONE
    // });
    const accountId = localStorage.getItem(ACCOUNT_ID) || '';
    const [isErrorAccountId, setIsErrorAccountId] = useState(false);


    const [paramHistorySearch, setParamHistorySearch] = useState<IParamOrderHistory>({
        page: START_PAGE,
        page_size: DEFAULT_ITEM_PER_PAGE,
        symbol_code: '',
        order_state: 0,
        order_side: 0,
        from_time: convertDatetoTimeStamp(currentDate, FROM_DATE_TIME),
        to_time: convertDatetoTimeStamp(currentDate, TO_DATE_TIME),
        order_type: tradingModel.OrderType.OP_NONE,
        account_id: accountId,
    });

    const [totalItem, setTotalItem] = useState<number>(0);
    const [isDownload, setIsDownLoad] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [isLastPage, setIsLastPage] = useState(false);

    const getDataOrderHistory = (params : IParamOrderHistory) => {
        const urlGetOrderHistory = `${api_url}${API_GET_ORDER_HISTORY}`;

        axios.post(urlGetOrderHistory, params, defindConfigPost()).then((resp) => {
            if (resp.status === success) {
                const data = resp.data.results;
                const totalRecord = resp.data.count;
                const lastPage = resp.data.total_page;

                paramHistorySearch.page_size < DEFAULT_ITEM_PER_PAGE ? setTotalItem(totalRecord) : setTotalItem(10)

                paramHistorySearch.page === lastPage ? setIsLastPage(true) : setIsLastPage(false);

                if(paramHistorySearch.page === START_PAGE ||  paramHistorySearch.page_size !== DEFAULT_ITEM_PER_PAGE){
                    setListOrderHistory(data);
                }else{
                    const tmpData = [...listOrderHistory, ...data];
                    setListOrderHistory(tmpData);
                }

                setIsErrorAccountId(false);
            }
        }).catch(function (error) {
            if (error.response.status === unAuthorised) {
                setIsErrorAccountId(true);
                setListOrderHistory([]);
                return;
            }
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

    // const handleSearch = (item: IParamHistorySearch) => {
    //     setParamHistorySearch(item);
    //     const from = isNaN(item.fromDate) ? 0 : item.fromDate;
    //     const currentDate = moment().format(FORMAT_DATE);
    //     const to = isNaN(item.toDate) ? convertDatetoTimeStamp(currentDate, TO_DATE_TIME) : item.toDate;
    //     sendListOrder(from, to);
    // }

    const handleSearch = (value: boolean) => {
        setIsSearch(value);
    }

    const handleDownLoad = (value: boolean) => {
        setIsDownLoad(value);
    }

    const resetListOrder = (value) => {
        setListOrderHistory(value);
    }

    const _renderOrderHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <OrderHistorySearch 
                            resetFlagSearch={handleSearch}
                            handleDownLoad={handleDownLoad}
                            paramHistorySearch={paramHistorySearch}
                            setParamHistorySearch={setParamHistorySearch}
                            isErrorAccountId={isErrorAccountId}
                            resetListOrder={resetListOrder}
                        />
                        <OrderTable
                            listOrderHistory={listOrderHistory}
                            paramHistorySearch={paramHistorySearch}
                            setParamHistorySearch={setParamHistorySearch}
                            isDownLoad={isDownload}
                            resetFlagDownload={handleDownLoad} 
                            isSearch={isSearch}
                            resetFlagSearch={handleSearch}
                            totalItem={totalItem}
                            isLastPage={isLastPage}
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