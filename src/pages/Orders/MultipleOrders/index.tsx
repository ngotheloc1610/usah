import { useEffect, useState } from "react";
import Pagination from "../../../Common/Pagination";
import { LIST_TICKER_INFO, OBJ_AUTHEN, SIDE, SOCKET_CONNECTED } from "../../../constants/general.constant";
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
    const [symbolListLocal, setSymbolListLocal] = useState(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]'));
    const [dataConfirm, setDataConfirm] = useState<IListOrder[]>([]);
    const [showModalModify, setShowModalModify] = useState<boolean>(false);

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
                const assignListOrder = listOrderSortDate.reduce((listOrder: IListOrder[], item) => {
                    return [...listOrder, { ...item, orderSideChange: item.orderType, isChecked: false, volumeChange: item.amount, priceChange: item.price }];
                }, []);
                setGetDataOrder(assignListOrder);
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

    const changeMultipleSide = (event, itemSymbol: IListOrder) => {
        const [value] = event.target;
        const listOrder = getDataOrder.reduce((listOrder: IListOrder[], item) => {
            if (Number(itemSymbol.orderId) === Number(item.orderId)) {
                return [...listOrder, { ...item, orderSideChange: value }];
            }
            return [...listOrder, item];
        }, []);
        setGetDataOrder(listOrder);
    }

    const changeVolume = (value: string, itemSymbol: IListOrder) => {
        const listOrder = getDataOrder.reduce((listOrder: IListOrder[], item) => {
            if (Number(itemSymbol.orderId) === Number(item.orderId)) {
                if (Number(value.replaceAll(',', '')) <= Number(item.amount)) {
                    return [...listOrder, { ...item, volumeChange: value.replaceAll(',', '') }];
                }
                return [...listOrder, item];
            }
            return [...listOrder, item];
        }, []);
        setGetDataOrder(listOrder);
    }

    const changePrice = (value: string, itemSymbol: IListOrder) => {
        const listOrder = getDataOrder.reduce((listOrder: IListOrder[], item) => {
            if (Number(itemSymbol.orderId) === Number(item.orderId)) {
                return [...listOrder, { ...item, priceChange: value.replaceAll(',', '') }];
            }
            return [...listOrder, item];
        }, []);
        setGetDataOrder(listOrder);
    }

    const decreaseVolume = (itemSymbol: IListOrder) => {
        const listOrder = getDataOrder.reduce((listOrder: IListOrder[], item) => {
            if (Number(itemSymbol.orderId) === Number(item.orderId)) {
                if ((Number(item.volumeChange) - 1) > 0) {
                    return [...listOrder, { ...item, volumeChange: (Number(item.volumeChange) - 1).toString() }];
                }
                return [...listOrder, item];
            }
            return [...listOrder, item];
        }, []);
        setGetDataOrder(listOrder);
    }

    const increaseVolume = (itemSymbol: IListOrder) => {
        const listOrder = getDataOrder.reduce((listOrder: IListOrder[], item) => {
            if (Number(itemSymbol.orderId) === Number(item.orderId)) {
                if ((Number(item.volumeChange) + 1) <= Number(item.amount)) {
                    return [...listOrder, { ...item, volumeChange: (Number(item.volumeChange) + 1).toString() }];
                }
                return [...listOrder, item];
            }
            return [...listOrder, item];
        }, []);
        setGetDataOrder(listOrder);
    }

    const decreasePrice = (itemSymbol: IListOrder) => {
        const listOrder = getDataOrder.reduce((listOrder: IListOrder[], item) => {
            if (Number(itemSymbol.orderId) === Number(item.orderId)) {
                return [...listOrder, { ...item, priceChange: (Number(item.priceChange) - 1).toString() }];
            }
            return [...listOrder, item];
        }, []);
        setGetDataOrder(listOrder);
    }

    const increasePrice = (itemSymbol: IListOrder) => {
        const listOrder = getDataOrder.reduce((listOrder: IListOrder[], item) => {
            if (Number(itemSymbol.orderId) === Number(item.orderId)) {
                return [...listOrder, { ...item, priceChange: (Number(item.priceChange) + 1).toString() }];
            }
            return [...listOrder, item];
        }, []);
        setGetDataOrder(listOrder);
    }

    const handleChecked = (event: any) => {
        const { name, checked } = event.target;
        if (name === "allSelect") {
            const isSelectAll = getDataOrder.map((order) => {
                return { ...order, isChecked: checked };
            });
            setGetDataOrder(isSelectAll);
        } else {
            let tempOrder = getDataOrder.map((order, index) =>
                Number(index) === Number(name) ? { ...order, isChecked: checked } : order
            );
            setGetDataOrder(tempOrder);
        }
    }

    const showScreenConfirmOrder = () => {
        const orderConfirm = getDataOrder.filter(item => (item.isChecked && ((Number(item.volumeChange) !== Number(item.amount)) || (Number(item.priceChange) !== Number(item.price)))));
        if (orderConfirm.length > 0) {
            setDataConfirm(orderConfirm);
            setShowModalModify(true);
        }
    }

    const _renderHearderMultipleOrders = () => (
        <tr>
            <th>
                <input type="checkbox" value=""
                    name="allSelect"
                    onChange={handleChecked}
                    checked={!getDataOrder.some((order) => order?.isChecked !== true)} />
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
            return <tr key={index}>
                <td><input type="checkbox" value="" checked={item?.isChecked} name={index.toString()} onChange={handleChecked} /></td>
                <td>{index}</td>
                <td className="text-center">{getTickerData(item.symbolCode)?.symbolCode}</td>
                <td className="text-center">{getTickerData(item.symbolCode)?.symbolName}</td>
                <td className="text-end">Limit</td>
                <td className="text-end">
                    <select value={getSide(item.orderSideChange ? item.orderSideChange : item.orderType)?.code}
                        name={index.toString()} onChange={(e) => changeMultipleSide(e, item)} className={`border-1
                    ${(item.orderSideChange === tradingModelPb.OrderType.OP_BUY) ? 'text-danger' : 'text-success'} text-end w-100-persent`}>
                        <option value={tradingModelPb.OrderType.OP_BUY} className="text-danger text-center">Buy</option>
                        <option value={tradingModelPb.OrderType.OP_SELL} className="text-success text-center">Sell</option>
                    </select>
                </td>
                <td className="text-end">
                    <div className="d-flex">
                        <svg
                            onClick={(e) => decreaseVolume(item)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-left-fill"
                            viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                        </svg>
                        <CurrencyInput decimalscale={0} type="text" className="form-control text-end border-1 p-0"
                            onChange={(e) => changeVolume(e.target.value, item)}
                            thousandseparator="{true}" value={formatNumber(item.volumeChange ? item.volumeChange : item.amount)} placeholder=""
                        // onChange={title.toLocaleLowerCase() === 'price' ? (e, maskedVal) => {setPrice(+maskedVal)} : (e) => {setVolume(e.target.value.replaceAll(',',''))}}
                        />
                        <svg
                            onClick={(e) => increaseVolume(item)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16"
                        >
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                        </svg>
                    </div>
                </td>
                <td className="text-end">
                    <div className="d-flex">
                        <svg
                            onClick={(e) => decreasePrice(item)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-left-fill"
                            viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                        </svg>
                        <CurrencyInput
                            onChange={(e) => changePrice(e.target.value, item)}
                            decimalscale={0} type="text" className="form-control text-end border-1 p-0"
                            thousandseparator="{true}" value={formatNumber(item.priceChange ? item.priceChange : item.price)} placeholder=""
                        // onChange={title.toLocaleLowerCase() === 'price' ? (e, maskedVal) => {setPrice(+maskedVal)} : (e) => {setVolume(e.target.value.replaceAll(',',''))}}
                        />
                        <svg
                            onClick={(e) => increasePrice(item)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16">
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                        </svg>
                    </div>
                </td>
            </tr>
        })
    )

    const _renderHearderMultipleOrdersConfirm = () => (
        <tr>
            <th className="text-center"><span>Ticker Code</span></th>
            <th className="text-center"><span>Ticker Name</span></th>
            <th className="text-end"><span>Order Type</span></th>
            <th className="text-end"><span>Order Side</span></th>
            <th className="text-end"><span>Volume</span></th>
            <th className="text-end"><span>Price</span></th>
        </tr>
    )
    const _renderDataMultipleOrdersConfirm = () => (
        dataConfirm.map((item, index) => {
            return <tr key={index}>
                <td className="text-center">{getTickerData(item.symbolCode)?.symbolCode}</td>
                <td className="text-center">{getTickerData(item.symbolCode)?.symbolName}</td>
                <td className="text-end">Limit</td>
                <td className={`border-1
                    ${(item.orderSideChange === tradingModelPb.OrderType.OP_BUY) ? 'text-danger' : 'text-success'} text-end w-100-persent`}>
                    {getSide(item.orderSideChange ? item.orderSideChange : item.orderType)?.title}
                </td>
                <td className="text-end">{formatNumber(item.volumeChange ? item.volumeChange : item.amount)}</td>
                <td className="text-end"> {formatNumber(item.priceChange ? item.priceChange : item.price)}</td>
            </tr>
        })
    )
    const _renderPopupConfirm = () => {
        return <div className="popup-box">
            <div className="box d-flex">
                Multiple Orders
                <span className="close-icon" onClick={() => setShowModalModify(false)}>x</span>
            </div>
            <div className='content text-center'>
                <table className="table table-sm table-hover mb-0 dataTable no-footer">
                    <thead>
                        {_renderHearderMultipleOrdersConfirm()}
                    </thead>
                    <tbody>
                        {_renderDataMultipleOrdersConfirm()}
                    </tbody>
                </table>
                <div className="text-end mb-3 mt-10">
                    <a href="#" className="btn btn-outline-secondary btn-clear mr-10" onClick={(e) => setShowModalModify(false)}>Clear</a>
                    <a href="#" className="btn btn-primary btn-submit">
                        Settlement</a>
                </div>
            </div>
        </div>
    }
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
                            <button type="button" className="btn btn-primary" onClick={showScreenConfirmOrder}>Execute</button>
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
        {showModalModify && _renderPopupConfirm()}
    </div>

};
export default MultipleOrders;