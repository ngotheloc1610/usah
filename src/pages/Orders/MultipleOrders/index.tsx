import { useEffect, useState } from "react";
import Pagination from "../../../Common/Pagination";
import { CURRENT_CHOOSE_TICKER, OBJ_AUTHEN, SIDE, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { IListOrder } from "../../../interfaces/order.interface";
import { wsService } from "../../../services/websocket-service";
import queryString from 'query-string';
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import ReduxPersist from "../../../config/ReduxPersist";
import { IAuthen } from "../../../interfaces";
import * as qspb from "../../../models/proto/query_service_pb";
import * as rspb from "../../../models/proto/rpc_pb";
import * as tspb from '../../../models/proto/trading_model_pb';
import { formatCurrency, formatNumber } from "../../../helper/utils";
import CurrencyInput from 'react-currency-masked-input';
import './multipleOrders.css';


const MultipleOrders = () => {
    const [getDataOrder, setGetDataOrder] = useState<IListOrder[]>([]);
    const [symbolListLocal, setSymbolListLocal] = useState(JSON.parse(localStorage.getItem(CURRENT_CHOOSE_TICKER) || '{}'));

    const tradingModelPb: any = tspb;

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

    const getTickerData = (symbolCode: number) => {
        const itemSymbolListLocal = symbolListLocal.find(item => item.symbolId === Number(symbolCode));
        if (itemSymbolListLocal) {
            return itemSymbolListLocal;
        }
        return [];
    }

    const getSide = (sideId: number) => {
        return SIDE.find(item => item.code === sideId);
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

    const changeMultipleSide = (e) => {
        console.log(101, e.target.value);
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
            <th></th>
        </tr>
    )
    const _renderDataMultipleOrders = () => (
        getDataOrder.map((item, index) => {
            return <tr>
                <td><input type="checkbox" value="" /></td>
                <td>{index}</td>
                <td className="text-center">{getTickerData(item.symbolCode)?.symbolCode}</td>
                <td className="text-center">{getTickerData(item.symbolCode)?.symbolName}</td>
                <td className="text-end">Limit</td>
                <td className="text-end">
                    <select value={item.orderSideChange ? getSide(item.orderSideChange)?.code : getSide(item.orderType)?.code} onChange={(e)=> changeMultipleSide(e)} className={`border-1 ${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'} text-end w-100-persent`}>
                        <option value={tradingModelPb.OrderType.OP_BUY} className="text-danger text-center">Buy</option>
                        <option value={tradingModelPb.OrderType.OP_SELL} className="text-success text-center">Sell</option>
                    </select>
                </td>
                <td className="text-end">
                    <div className="d-flex">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-left-fill"
                            viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                        </svg>
                        <CurrencyInput decimalscale={0} type="text" className="form-control text-end border-1 p-0"
                            thousandseparator="{true}" value={formatNumber(item.amount)} placeholder=""
                        // onChange={title.toLocaleLowerCase() === 'price' ? (e, maskedVal) => {setPrice(+maskedVal)} : (e) => {setVolume(e.target.value.replaceAll(',',''))}}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16"
                        >
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                        </svg>
                    </div>
                </td>
                <td className="text-end">
                    <div className="d-flex">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-left-fill"
                            viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                        </svg>
                        <CurrencyInput decimalscale={0} type="text" className="form-control text-end border-1 p-0"
                            thousandseparator="{true}" value={formatNumber(item.price)} placeholder=""
                        // onChange={title.toLocaleLowerCase() === 'price' ? (e, maskedVal) => {setPrice(+maskedVal)} : (e) => {setVolume(e.target.value.replaceAll(',',''))}}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16"
                        >
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                        </svg>
                    </div>
                </td>
                <td></td>
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
                <div className="card-modify mb-3">
                    <div className="card-body p-0 mb-3 table table-responsive">
                        <table className="table table-sm table-hover mb-0 dataTable no-footer">
                            <thead>
                                {_renderHearderMultipleOrders()}
                            </thead>
                            <tbody>
                                {_renderDataMultipleOrders()}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-3">
                    <Pagination />
                </div>
            </div>
        </div>
    </div>

};
export default MultipleOrders;