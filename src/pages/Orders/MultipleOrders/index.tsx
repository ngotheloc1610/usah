import { useEffect, useState } from "react";
import Pagination from "../../../Common/Pagination";
import { CURRENT_CHOOSE_TICKER, OBJ_AUTHEN, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { IListOrder } from "../../../interfaces/order.interface";
import { wsService } from "../../../services/websocket-service";
import queryString from 'query-string';
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import ReduxPersist from "../../../config/ReduxPersist";
import { IAuthen } from "../../../interfaces";
import * as qspb from "../../../models/proto/query_service_pb";
import * as rspb from "../../../models/proto/rpc_pb";


const MultipleOrders = () => {
    const [getDataOrder, setGetDataOrder] = useState<IListOrder[]>([]);
    const [symbolListLocal, setSymbolListLocal] = useState(JSON.parse(localStorage.getItem(CURRENT_CHOOSE_TICKER) || '{}'))

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendListOrder();
                sendMsgSymbolList();
            }
        });
        
        const listOrder = wsService.getListOrder().subscribe(response => {
            if (response.orderList) {
                const listOrderSortDate: IListOrder[] = response.orderList.sort((a, b) => b.time - a.time);
                setGetDataOrder(listOrderSortDate);
            }
        });

        return () => {
            ws.unsubscribe();
            listOrder.unsubscribe();
        }
    }, []);

    const getTickerData = (symbolCode: number)  => {
        const itemSymbolListLocal = symbolListLocal.find(item => item.symbolId === Number(symbolCode));
        console.log(41, itemSymbolListLocal);
        if (itemSymbolListLocal) {
            return itemSymbolListLocal;
        }
        return [];
    }

    const sendListOrder = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string | any = '';
        if (objAuthen.access_token) {
            accountId = objAuthen.account_id;
            ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen));
            prepareMessage(accountId);
            return;
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then(resp => {
            if (resp) {
                const obj: IAuthen = JSON.parse(resp);
                accountId = obj.account_id;
                prepareMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID;
                prepareMessage(accountId);
                return;
            }
        });
    }

    const prepareMessage = (accountId: string) => {
        const uid = accountId;
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();

            orderRequest.setAccountId(uid);
            rpcMsg.setPayloadData(orderRequest.serializeBinary());

            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const _renderHearderMultipleOrders = () => (
        <tr>
            <th>
                <input type="checkbox" value="" />
            </th>
            <th><span>No.</span></th>
            <th className="text-center"><span>Ticker Code</span></th>
            <th className="text-center"><span>Ticker Name</span></th>
            <th className="text-end"><span>Order Type</span></th>
            <th className="text-end"><span>Order Side</span></th>
            <th className="text-end"><span>Volume</span></th>
            <th className="text-end"><span>Price</span></th>
        </tr>
    )
    const _renderDataMultipleOrders = () => (
        getDataOrder.map((item, index) => {
            return <tr>
                <td><input type="checkbox" value="" /></td>
                <td>{index}</td>
                <td>{getTickerData(item.symbolCode)?.ticker}</td>
                <td>{getTickerData(item.symbolCode)?.tickeName}</td>
            </tr>
        })
    )

    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Multiple Orders</h6>
                </div>
                <div className="d-flex justify-content-sm-between m-3">
                    <div className="d-flex">
                        <button type="button" className="btn btn-warning">Add Order</button>

                        <button type="button" className="ml-4 btn btn-success">Import</button>

                    </div>
                    <div className="d-flex">
                        <button type="button" className="btn btn-danger ml-4">Delete</button>

                        <div className="d-flex">
                            <button type="button" className="btn btn-warning  ml-4">3 Selected</button>

                            <button type="button" className="btn btn-primary">Execute</button>

                        </div>

                    </div>
                </div>
                <div className="table table-responsive">
                    <table className="table table-sm table-hover mb-0 dataTable no-footer">
                        <thead>
                            {_renderHearderMultipleOrders()}
                        </thead>
                        <tbody>
                            {_renderDataMultipleOrders()}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3">
                    <Pagination />
                </div>
            </div>
        </div>
    </div>

};
export default MultipleOrders;