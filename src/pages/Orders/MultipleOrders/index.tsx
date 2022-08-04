import { useEffect, useMemo, useRef, useState } from "react";
import { ACCOUNT_ID, DEFAULT_ITEM_PER_PAGE, LIST_TICKER_INFO, MESSAGE_TOAST, MSG_CODE, MSG_TEXT, STATUS_ORDER, RESPONSE_RESULT, SIDE_NAME, START_PAGE, CURRENCY, TITLE_ORDER_CONFIRM, LIST_TICKER_ALL, MIN_ORDER_VALUE, MAX_ORDER_VOLUME, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { ISymbolMultiOrder, IOrderListResponse, ILastQuote, ISymbolQuote } from "../../../interfaces/order.interface";
import { wsService } from "../../../services/websocket-service";
import * as rspb from "../../../models/proto/rpc_pb";
import * as tspb from '../../../models/proto/trading_model_pb';
import * as pspb from '../../../models/proto/pricing_service_pb';
import { formatNumber, formatCurrency, calcPriceIncrease, calcPriceDecrease, convertNumber, handleAllowedInput, getSymbolCode, checkMessageError, renderSideText } from "../../../helper/utils";
import './multipleOrders.scss';
import * as tdspb from '../../../models/proto/trading_service_pb';
import * as smpb from '../../../models/proto/system_model_pb';
import * as qmpb from '../../../models/proto/query_model_pb';
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import * as tdpb from '../../../models/proto/trading_model_pb';
import { Autocomplete, TextField } from "@mui/material";
import { FILE_MULTI_ORDER_SAMPLE, ICON_FILE } from "../../../assets";
import { useDispatch, useSelector } from "react-redux";
import { keepListOrder } from '../../../redux/actions/Orders';
import { ORDER_RESPONSE } from "../../../constants";
import NumberFormat from "react-number-format";
import { MESSAGE_ERROR } from "../../../constants/message.constant";

const MultipleOrders = () => {
    const listOrderDispatch = useSelector((state: any) => state.orders.listOrder);
    // dispatch thực hiện các action khác nhau với các payload khác nhau nên sẽ khai báo any ở đây
    const dispatch: any = useDispatch();
    const tradingModelPb: any = tspb;
    const tradingModel: any = tdpb;
    const queryModel: any = qmpb;
    const [listTickers, setListTickers] = useState<ISymbolMultiOrder[]>([]);
    const [showModalConfirmMultiOrders, setShowModalConfirmMultiOrders] = useState<boolean>(false);
    const [statusOrder, setStatusOrder] = useState(0);
    const [listSelected, setListSelected] = useState<ISymbolMultiOrder[]>([]);
    const [currentSide, setCurrentSide] = useState(tradingModel.Side.NONE);
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(0);
    const [isAddOrder, setIsAddOrder] = useState(false);
    const [ticker, setTicker] = useState('');
    const [sideAddNew, setSideAddNew] = useState('Sell');
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [isDelete, setIsDelete] = useState(false);
    const [statusPlace, setStatusPlace] = useState(false);
    const [orderListResponse, setOrderListResponse] = useState<IOrderListResponse[]>([]);
    const [invalidPrice, setInvalidPrice] = useState(false);
    const [invalidVolume, setInvalidVolume] = useState(false);
    const [isShowNotiErrorPrice, setIsShowNotiErrorPrice] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [symbolInfor, setSymbolInfor] = useState<ISymbolQuote[]>([]);

    const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
    const symbolListActive = symbols.filter(item => item.symbolStatus !== queryModel.SymbolStatus.SYMBOL_DEACTIVE);
    const minOrderValue = localStorage.getItem(MIN_ORDER_VALUE);
    const maxOrderVolume = localStorage.getItem(MAX_ORDER_VOLUME);

    const systemModelPb: any = smpb;

    const ref: any = useRef();

    useEffect(() => {
        const listOrderDisplay = listOrderDispatch ? listOrderDispatch.filter(item => item.status === undefined) : [];
        setListTickers(listOrderDisplay);
    }, [])

    useEffect(() => {
        const multiOrderResponse = wsService.getMultiOrderSubject().subscribe(resp => {
            let tmp = 0;
            if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                tmp = RESPONSE_RESULT.success;
            } else {
                tmp = RESPONSE_RESULT.error;
            }
            getStatusOrderResponse(tmp, resp[MSG_TEXT], resp?.orderList, resp[MSG_CODE]);
            if (resp && resp.orderList) {
                setOrderListResponse(resp.orderList);
                setStatusPlace(true);
                setListSelected([]);
            }

        });

        return () => {
            multiOrderResponse.unsubscribe();
        }
    }, []);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessageQuotes();
            }
        });
        
        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setLastQuotes(quote.quotesList);
            }
        })        

        return () => {
            ws.unsubscribe();
            lastQuote.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processLastQuote(lastQuotes)
    }, [lastQuotes])

    const processLastQuote = (quotes: ILastQuote[]) => {
        if (quotes.length > 0) {
            let temp: ISymbolQuote[] = [];
            symbols.forEach(symbol => {
                if (symbol) {
                    const element = quotes.find(o => o?.symbolCode === symbol?.symbolCode);
                    if (element) {
                        const symbolQuote: ISymbolQuote = {
                            symbolCode: symbol.symbolCode,
                            symbolId: symbol.symbolId,
                            symbolName: symbol.symbolName,
                            prevClosePrice: symbol.prevClosePrice,
                            high: element?.high || '0',
                            low: element?.low || '0',
                            lastPrice: element.currentPrice,
                            open: element.open || '0',
                            volume: element.volumePerDay,
                            ceiling: symbol.ceiling,
                            floor: symbol.floor
                        };
                        const index = temp.findIndex(o => o?.symbolCode === symbolQuote?.symbolCode);
                        if (index < 0) {
                            temp.push(symbolQuote);
                        }
                    }
                }
            });
            temp = temp.sort((a, b) => a?.symbolCode?.localeCompare(b?.symbolCode));
            setSymbolInfor(temp);
        }
    }

    useEffect(() => {
        if (!ticker?.trim()) {
            setPrice(0)
            setVolume(0)
        }
        if (ref.current !== '') {
            setCurrentSide(tradingModel.Side.NONE);
        }
        ref.current = ticker;
    }, [ticker])

    useEffect(() => {
        setCurrentSide(tradingModel.Side.NONE);
    }, [isAddOrder])

    useEffect(() => {
        isDelete ? setCurrentPage(currentPage) : setCurrentPage(START_PAGE);
    }, [listTickers, isDelete])

    useEffect(() => {
        processOrderListResponse(orderListResponse)
    }, [orderListResponse])

    const sendMessageQuotes = () => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();

            const symbolCodes: string[] = symbols.map(item => item.symbolCode);
            lastQuotesRequest.setSymbolCodeList(symbolCodes);

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const processOrderListResponse = (orderList: IOrderListResponse[]) => {
        if (orderList && orderList.length > 0) {
            const temps = [...listSelected];
            orderList.forEach((item: IOrderListResponse) => {
                if (item) {
                    const listIndex = temps.reduce((listIndex: number[], order: ISymbolMultiOrder, idx: number) => {
                        if (order?.ticker === item?.symbolCode && convertNumber(order?.price.replaceAll(',', '')) === convertNumber(item.price))
                            listIndex.push(idx);
                        return listIndex;
                    }, []);
                    const txtSide = renderSideText(item.side);
                    listIndex.forEach(el => {
                        if (temps[el].orderSide.toLowerCase()?.trim() === txtSide?.toLowerCase()?.trim() && convertNumber(temps[el].volume) === convertNumber(item.amount)) {
                            temps[el] = {
                                ...temps[el],
                                state: item.state,
                                msgCode: item.msgCode,
                                status: checkMessageError(item.note, item.msgCode)
                            }
                        }
                    });
                }
            });

            const tickers: any[] = [];
            listTickers.forEach(item => {
                const idx = temps.findIndex(o => o?.no === item?.no);
                if (idx >= 0) {
                    const msgErr = temps[idx]?.msgCode && temps[idx]?.msgCode === systemModelPb.MsgCode.MT_RET_ERR_NOT_ENOUGH_MONEY ? 
                            temps[idx]?.status : MESSAGE_ERROR.get(temps[idx].msgCode);
                    tickers.push({
                        ...temps[idx],
                        message:  temps[idx].msgCode ? msgErr : MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_OK)
                    });
                } else {
                    tickers.push({
                        ...item,
                        message: item.message
                    });
                }
            });
            setListTickers(tickers);
            dispatch(keepListOrder(tickers));
        }
    }

    const changeMultipleSide = (value: number, itemSymbol: ISymbolMultiOrder, index: number) => {
        switch (value) {
            case tradingModelPb.Side.BUY.toString(): {
                listTickers[index].orderSide = SIDE_NAME.buy;
                break;
            }
            default: {
                listTickers[index].orderSide = SIDE_NAME.sell;
                break;
            }
        }
        const orders = [...listTickers];
        setListTickers(orders);
    }

    const updateTickerInfo = (currentTickerInfo: ISymbolMultiOrder, volume: string, price: string) => {
        const temp = {
            ...currentTickerInfo,
            volume: volume,
            price: price,
            msgCode: getStatusOrder(currentTickerInfo?.ticker, volume, price) ? 
                getStatusOrder(currentTickerInfo?.ticker, volume, price)?.msgCode : null,
            message: getStatusOrder(currentTickerInfo?.ticker, volume, price) ? 
                getStatusOrder(currentTickerInfo?.ticker, volume, price)?.message : ''
        }
        return temp;
    }

    const changeVolume = (value: string, itemSymbol: ISymbolMultiOrder, index: number) => {
        const lotSize = getLotSize(itemSymbol.ticker);
        const val = value.replaceAll(',', '');
        let newValue = '';
        if (!isNaN(Number(val))) {
            if (Number(val) > 0) {
                newValue = Number(val).toString();
            } else {
                newValue = lotSize.toString();
            }
        }

        listTickers[index] = updateTickerInfo(listTickers[index], newValue, listTickers[index]?.price);

        if (listSelected.length > 0) {
            const temps = [...listSelected];
            const idx = temps.findIndex(o => o?.no === itemSymbol?.no);
            if (idx >= 0) {
                temps[idx] = {
                    ...temps[idx],
                    volume: newValue
                }
                setListSelected(temps);
            }
        }

        const listOrder = [...listTickers];
        setListTickers(listOrder);
    }


    const changePrice = (value: string, itemSymbol: ISymbolMultiOrder, index: number) => {
        const price = convertNumber(value)
        const tickSize = getTickSize(itemSymbol.ticker);
        let newValue = '';
        if (price > 0) {
            newValue = price.toString();
        } else {
            newValue = tickSize.toString();
        }

        listTickers[index] = updateTickerInfo(listTickers[index], listTickers[index]?.volume, newValue);

        const listOrder = [...listTickers];
        setListTickers(listOrder);

        if (listSelected.length > 0) {
            const temps = [...listSelected];
            const idx = temps.findIndex(o => o?.no === itemSymbol?.no);
            if (idx >= 0) {
                temps[idx] = {
                    ...temps[idx],
                    price: newValue.toString()
                }
                setListSelected(temps);
            }
        }
    }

    const getLotSize = (ticker: string) => {
        const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const lotSize = lstSymbols.find(o => o?.symbolCode === ticker)?.lotSize;
        if (lotSize) {
            return !isNaN(Number(lotSize)) ? Number(lotSize) : 1;
        }
        return 1;
    }

    const getTickSize = (ticker: string) => {
        const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tickSize = lstSymbols.find(o => o?.symbolCode === ticker)?.tickSize;
        if (tickSize) {
            return !isNaN(Number(tickSize)) ? Number(tickSize) : 1;
        }
        return 1;
    }

    const getCelling = (ticker: string) => {
        const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tickSize = lstSymbols.find(o => o?.symbolCode === ticker)?.ceiling;
        if (tickSize) {
            return !isNaN(Number(tickSize)) ? Number(tickSize) : 0;
        }
        return 0
    }

    const getFloor = (ticker: string) => {
        const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tickSize = lstSymbols.find(o => o?.symbolCode === ticker)?.floor;
        if (tickSize) {
            return !isNaN(Number(tickSize)) ? Number(tickSize) : 0;
        }
        return 0
    }

    const decreaseVolume = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const lotSize = getLotSize(itemSymbol.ticker);
        const newValue = (convertNumber(itemSymbol.volume) - lotSize) > 0 ? (convertNumber(itemSymbol.volume) - lotSize) : lotSize;

        listTickers[index] = updateTickerInfo(listTickers[index], newValue.toString(), listTickers[index]?.price);

        const listOrder = [...listTickers];
        setListTickers(listOrder);

        if (listSelected.length > 0) {
            const temps = [...listSelected];
            const idx = temps.findIndex(o => o?.no === itemSymbol?.no);
            if (idx >= 0) {
                temps[idx] = {
                    ...temps[idx],
                    volume: newValue.toString()
                }
                setListSelected(temps);
            }
        }
    }

    const increaseVolume = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const lotSize = getLotSize(itemSymbol.ticker);
        const newValue = (convertNumber(itemSymbol.volume) + lotSize) > 0 ? (convertNumber(itemSymbol.volume) + lotSize) : lotSize;

        listTickers[index] = updateTickerInfo(listTickers[index], newValue.toString(), listTickers[index]?.price);

        const listOrder = [...listTickers];
        setListTickers(listOrder);

        if (listSelected.length > 0) {
            const temps = [...listSelected];
            const idx = temps.findIndex(o => o?.no === itemSymbol?.no);
            if (idx >= 0) {
                temps[idx] = {
                    ...temps[idx],
                    volume: newValue.toString(),
                }
                setListSelected(temps);
            }
        }
    }

    const decreasePrice = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const tickSize = getTickSize(itemSymbol.ticker);
        const celling = getCelling(itemSymbol.ticker);
        const floorPrice = getFloor(itemSymbol.ticker);
        let newValue = (convertNumber(itemSymbol.price) - tickSize) > 0 ? (convertNumber(itemSymbol.price) - tickSize) : tickSize;
        if (newValue > celling) {
            newValue = celling;
        } else if (newValue < floorPrice) {
            newValue = floorPrice;
        }

        listTickers[index] = updateTickerInfo(listTickers[index], listTickers[index]?.volume, newValue.toString());

        const listOrder = [...listTickers];
        setListTickers(listOrder);

        if (listSelected.length > 0) {
            const temps = [...listSelected];
            const idx = temps.findIndex(o => o?.no === itemSymbol?.no);
            if (idx >= 0) {
                temps[idx] = {
                    ...temps[idx],
                    price: newValue.toString()
                }
                setListSelected(temps);
            }
        }
    }

    const increasePrice = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const tickSize = getTickSize(itemSymbol.ticker);
        const celling = getCelling(itemSymbol.ticker);
        const floorPrice = getFloor(itemSymbol.ticker);
        let newValue = (convertNumber(itemSymbol.price) + tickSize) > 0 ? (convertNumber(itemSymbol.price) + tickSize) : tickSize;
        if (newValue > celling) {
            newValue = celling;
        } else if (newValue < floorPrice) {
            newValue = floorPrice;
        }

        listTickers[index] = updateTickerInfo(listTickers[index], listTickers[index]?.volume, newValue.toString());

        const listOrder = [...listTickers];
        setListTickers(listOrder);

        if (listSelected.length > 0) {
            const temps = [...listSelected];
            const idx = temps.findIndex(o => o?.no === itemSymbol?.no);
            if (idx >= 0) {
                temps[idx] = {
                    ...temps[idx],
                    price: newValue.toString()
                }
                setListSelected(temps);
            }
        }
    }

    const handleChecked = (isChecked: boolean, item: ISymbolMultiOrder) => {
        const tmp = [...listSelected];
        if (isChecked) {
            tmp.push(item);
        } else {
            const index = tmp.findIndex((o: ISymbolMultiOrder) => o.no === item.no && o.ticker == item.ticker && o.orderSide === item.orderSide);
            if (index >= 0) {
                tmp.splice(index, 1);
            }
        }
        setListSelected(tmp);
    }

    const handleCheckedAll = (isChecked: boolean) => {
        if (isChecked) {
            const temps: any[] = [];
            listTickers.forEach(item => {
                if (defindStatusOrder(item)?.props?.title === undefined) {
                    temps.push(item);
                }
            });
            setListSelected(temps);
        } else {
            setListSelected([]);
        }
    }

    const showScreenConfirmOrder = () => {
        if (listSelected.length > 0) {
            setShowModalConfirmMultiOrders(true);
        }
    }

    const deleteRecord = () => {
        const tmp = [...listTickers];
        listSelected.forEach(item => {
            const index = tmp.indexOf(item);
            if (index >= 0) {
                tmp.splice(index, 1);
            }
        });
        setIsDelete(true)
        dispatch(keepListOrder(tmp));
        setListTickers(tmp);
        setListSelected([]);
    }

    const checkedAll = () => {
        const temps: any[] = [];
        listTickers.forEach(item => {
            if (!defindStatusOrder(item)?.props?.title) {
                temps.push(item);
            }
        });
        return temps.length === listSelected.length && listSelected.length > 0;
    }

    const _renderHearderMultipleOrders = () => (
        <tr>
            <th>
                <input type="checkbox" value=""
                    name="allSelect"
                    onChange={(e: any) => handleCheckedAll(e.target.checked)}
                    checked={checkedAll()}
                />
            </th>
            <th><span>No.</span></th>
            <th className="text-left"><span>Ticker Code</span></th>
            <th className="text-left"><span>Order Type</span></th>
            <th className="text-left"><span>Order Side</span></th>
            <th className="text-end"><span>Quantity</span></th>
            <th className="text-end"><span>Price</span></th>
            <th className="text-end w-140"><span>Status</span></th>
        </tr>
    )

    const getTickerName = (ticker: string) => {
        const listSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tickerName = listSymbols.find(o => o?.symbolCode === ticker)?.symbolName;
        return tickerName ? tickerName : '';
    }

    const getOrderSideValue = (orderSide: string) => {
        if (orderSide) {
            switch (orderSide.toLocaleLowerCase()) {
                case SIDE_NAME.buy.toLocaleLowerCase(): {
                    return tradingModelPb.Side.BUY;
                }
                default: {
                    return tradingModelPb.Side.SELL;
                }
            }
        }
        return 0;
    }
    
    const handleKeyDown = (e) => {
        e.key !== 'Delete' ? setIsAllowed(true) : setIsAllowed(false)
    }

    const elementChecked = (item: ISymbolMultiOrder) => {
        const idx = listSelected.findIndex(o => o?.no === item?.no);
        return idx >= 0;
    }

    const _renderDataMultipleOrders = () => {
        return listTickers.map((item: ISymbolMultiOrder, index: number) => {
            return <tr key={index}>
                <td><input type="checkbox" disabled={defindStatusOrder(item).props.title !== undefined && item.state !== undefined} value="" name={index.toString()} onChange={(e) => handleChecked(e.target.checked, item)} checked={elementChecked(item)} /></td>
                <td>{index + 1}</td>
                <td className="text-left" title={getTickerName(item.ticker)}>{item.ticker}</td>
                <td className="text-left">Limit</td>
                <td className="text-left">
                    <select value={getOrderSideValue(item.orderSide)} className={`border-1
                    ${(getOrderSideValue(item.orderSide) === tradingModelPb.Side.BUY) ? 'text-danger' : 'text-success'} text-end w-100-persent`}
                        onChange={(e: any) => changeMultipleSide(e.target.value, item, index)}>
                        <option value={tradingModelPb.Side.BUY} className="text-danger text-left">Buy</option>
                        <option value={tradingModelPb.Side.SELL} className="text-success text-left">Sell</option>
                    </select>
                </td>
                <td className="text-end">
                    <div className="d-flex" onKeyDown={handleKeyDown}>
                        <NumberFormat decimalScale={0} type="text" className="form-control text-end border-1 py-0 px-10"
                            onValueChange={(e) => changeVolume(e.value, item, index)} isAllowed={(e) => handleAllowedInput(e.value, isAllowed)}
                            thousandSeparator="," value={formatNumber(item.volume?.replaceAll(',', ''))} placeholder=""
                        />
                        <div className="d-flex flex-column opacity-75">
                            <i className="bi bi-caret-up-fill line-height-16" onClick={() => increaseVolume(item, index)}></i>
                            <i className="bi bi-caret-down-fill line-height-16" onClick={() => decreaseVolume(item, index)}></i>
                        </div>
                    </div>
                </td>
                <td className="text-end">
                    <div className="d-flex">
                        <NumberFormat
                            onValueChange={(e) => changePrice(e.value, item, index)}
                            decimalScale={2} type="text" className="form-control text-end border-1 py-0 px-10"
                            thousandSeparator="," value={convertNumber(item.price?.replaceAll(',','')) === 0 ? null : formatCurrency(item.price?.replaceAll(',', ''))} placeholder=""
                        />
                        <div className="d-flex flex-column opacity-75">
                            <i className="bi bi-caret-up-fill line-height-16" onClick={() => increasePrice(item, index)}></i>
                            <i className="bi bi-caret-down-fill line-height-16" onClick={() => decreasePrice(item, index)}></i>
                        </div>
                    </div>
                </td>
                <td className="text-end">
                    <div title={item?.message?.toUpperCase()} className={`${item.msgCode === systemModelPb.MsgCode.MT_RET_OK ? 'text-success' : 'text-danger'} text-truncate`}>{item?.message?.toUpperCase()}</div>
                </td>
            </tr>
        })
    }

    const _renderHearderMultipleOrdersConfirm = () => (
        <tr>
            <th className="text-center text-nowrap"><span>Ticker Code</span></th>
            <th className="text-center text-nowrap"><span>Order Type</span></th>
            <th className="text-center text-center text-nowrap"><span>Order Side</span></th>
            <th className="text-center text-nowrap"><span>Quantity</span></th>
            <th className="text-center text-nowrap"><span>Price</span></th>
        </tr>
    )
    const _renderDataMultipleOrdersConfirm = () => (
        listSelected.map((item, index) => {
            return <tr key={index}>
                <td className="text-nowrap" title={getTickerName(item.ticker)}>{item.ticker}</td>
                <td className="text-center">Limit</td>
                <td className={`${(getOrderSideValue(item.orderSide) === tradingModelPb.Side.BUY) ? 'text-danger' : 'text-success'} text-center text-nowrap`}>
                    {item.orderSide.toUpperCase()}
                </td>
                <td className="text-center text-nowrap">{formatNumber(item.volume?.replaceAll(',', ''))}</td>
                <td className="text-center text-nowrap"> {formatCurrency(item.price?.replaceAll(',', ''))}</td>
            </tr>
        })
    )

    const callOrderRequest = () => {
        const accountId = localStorage.getItem(ACCOUNT_ID)
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tradingServicePb: any = tdspb;
        let wsConnected = wsService.getWsConnected();
        const tradingModelPb: any = tspb;
        if (wsConnected) {
            let currentDate = new Date();
            let multiOrder = new tradingServicePb.NewOrderMultiRequest();
            multiOrder.setSecretKey('');
            listSelected.forEach((item: ISymbolMultiOrder) => {
                const symbol = symbols.find(o => o.symbolCode === item.ticker);
                if (symbol) {
                    let order = new tradingModelPb.Order();
                    order.setAmount(item.volume?.replaceAll(',', ''));
                    order.setPrice(item.price.replaceAll(',', ''));
                    order.setUid(accountId);
                    order.setSymbolCode(symbol?.symbolCode);
                    order.setSide(getOrderSideValue(item.orderSide));
                    order.setOrderType(tradingModel.OrderType.OP_LIMIT);
                    order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
                    order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
                    order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
                    order.setCurrencyCode(CURRENCY.usd);
                    order.setSubmittedId(accountId);
                    order.setMsgCode(item.msgCode ? item.msgCode : systemModelPb.MsgCode.MT_RET_OK);
                    multiOrder.addOrder(order);
                }
            });
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.NEW_ORDER_MULTI_REQ);
            rpcMsg.setPayloadData(multiOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            setShowModalConfirmMultiOrders(false);
        }
    }
    const getStatusOrderResponse = (value: number, content: string, lstResponse: IOrderListResponse[], msgCode: number) => {
        if (statusOrder === 0) {
            setStatusOrder(value);
            if (lstResponse && lstResponse?.length > 0) {
                const lengItemSuccess = lstResponse?.filter(item => item?.state === tradingModel.OrderState.ORDER_STATE_PLACED)?.length;
                if (lengItemSuccess === 0) {
                    return <div>{toast.error(`${ORDER_RESPONSE.REJECT}: ${lstResponse.length}`)}</div>
                }
                if (lengItemSuccess !== lstResponse.length) {
                    return <div>{toast.warning(`${ORDER_RESPONSE.SUCCESS}: ${lengItemSuccess}, ${ORDER_RESPONSE.REJECT}: ${lstResponse?.length - lengItemSuccess}`)}</div>
                }

                if (lengItemSuccess === lstResponse.length) {
                    return <div>{toast.success(`${ORDER_RESPONSE.SUCCESS}: ${lengItemSuccess}`)}</div>
                }
            }
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        return <></>;
    }
    const _rendetMessageError = (message: string, msgCode: number) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.error(message)}</div>
    }
    const _rendetMessageSuccess = (message: string) => {
        return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
    }

    const checkSymbol = (symbolCode: string) => {
        const idx = symbolListActive.findIndex(o => o?.symbolCode === symbolCode);
        return idx >= 0;
    }

    const checkSideValid = (side: string) => {
        return side.toLowerCase().trim() === 'buy' || side.toLowerCase().trim() === 'sell';
    }

    const processData = (dataString: string) => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

        const list = [...listTickers];
        for (let i = 1; i < dataStringLines.length; i++) {
            const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
            if (headers && row.length == headers.length) {
                const obj: any = {};
                for (let j = 0; j < headers.length; j++) {
                    let d = row[j];
                    if (d.length > 0) {
                        if (d[0] == '"')
                            d = d.substring(1, d.length - 1);
                        if (d[d.length - 1] == '"')
                            d = d.substring(d.length - 2, 1);
                    }
                    if (headers[j]) {
                        obj[headers[j]] = d;
                    }
                }
                if (!checkSymbol(obj.Ticker)) {
                    toast.error("Symbol don't exist");
                    return;
                }

                if (isNaN(Number(obj.Quantity.replaceAll(',', '')))) {
                    toast.error('Invalid quantity');
                    return;
                }

                if (isNaN(Number(obj.Price.replaceAll(',', '')))) {
                    toast.error('Invalid price');
                    return;
                }

                if (!checkSideValid(obj.OrderSide)) {
                    toast.error('Invalid order side');
                    return;
                }

                if (Object.values(obj).filter(x => x).length > 0) {
                    const tmp: ISymbolMultiOrder = {
                        no: (list.length).toString(),
                        orderSide: obj.OrderSide,
                        price: formatCurrency(obj.Price.replaceAll(',', '')),
                        ticker: obj.Ticker,
                        volume: obj.Quantity || obj.Volume,
                        msgCode: getStatusOrder(obj.Ticker, obj.Quantity || obj.Volume, obj.Price) ? getStatusOrder(obj.Ticker, obj.Quantity || obj.Volume, obj.Price)?.msgCode : null,
                        message: getStatusOrder(obj.Ticker, obj.Quantity || obj.Volume, obj.Price) ? getStatusOrder(obj.Ticker, obj.Quantity || obj.Volume, obj.Price)?.message : ''
                    }
                    list.push(tmp);
                }
            }
        }
        setListTickers(list);
        dispatch(keepListOrder(list));
    }

    const getStatusOrder = (symbolCode: string, volume: any, price: any) => {
        const symbol = symbolListActive.find(o => o?.symbolCode === symbolCode);
        if (convertNumber(symbol?.ceiling) < convertNumber(price) || convertNumber(symbol?.floor) > convertNumber(price)) {
            return {
                msgCode: systemModelPb.MsgCode.MT_RET_INVALID_PRICE_RANGE,
                message: MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_INVALID_PRICE_RANGE)
            };
        }
        if ((convertNumber(price) * convertNumber(volume)) < convertNumber(minOrderValue)) {
            return {
                msgCode: systemModelPb.MsgCode.MT_RET_NOT_ENOUGH_MIN_ORDER_VALUE,
                message: MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_NOT_ENOUGH_MIN_ORDER_VALUE)
            }
        }
        if (convertNumber(volume) > convertNumber(maxOrderVolume)) {
            return {
                msgCode: systemModelPb.MsgCode.MT_RET_EXCEED_MAX_ORDER_VOLUME,
                message: MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_EXCEED_MAX_ORDER_VOLUME)
            }
        }
        return null;
    }

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt: any) => {
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws);
            processData(data);
        };
        reader.readAsBinaryString(file);
    }

    const handleSide = (value: string) => {
        setSideAddNew(value);
        switch (value.toLowerCase()) {
            case SIDE_NAME.buy.toLowerCase(): {
                setCurrentSide(tradingModel.Side.BUY);
                break;
            }
            default: {
                setCurrentSide(tradingModel.Side.SELL);
                break;
            }
        }
    }

    const getClassNameSideBtn = (side: string, className: string, positionSell: string, positionBuy: string) => {
        if (convertNumber(side) !== tradingModel.Side.NONE) {
          return side === tradingModel.Side.SELL ? `btn ${className} rounded text-white flex-grow-1 p-2 text-center ${positionSell}` : `btn ${className} rounded text-white flex-grow-1 p-2 text-center ${positionBuy}`
        }
        return `btn rounded text-white flex-grow-1 p-2 text-center `
    }

    const _renderButtonSideOrder = (side: string, className: string, title: string, sideHandle: string, positionSell: string, positionBuy: string) => (
        <button type="button"
        className={getClassNameSideBtn(side, className, positionSell, positionBuy)}
            onClick={() => handleSide(sideHandle)}>
            <span className="fs-5 text-uppercase">{title}</span>
        </button>
    )

    const handleChangeVolume = (value: string) => {
        const symbolCode = getSymbolCode(ticker);
        const lotSize = getLotSize(symbolCode);
        const volume = convertNumber(value);
        if ((volume || volume === 0) && volume > -1) {
            setVolume(volume);
            setInvalidVolume(volume % lotSize !== 0 || volume < 1);
        }
    }

    const handleChangePrice = (value: string) => {
        const symbolCode = getSymbolCode(ticker);
        const floorPrice = getFloor(symbolCode);
        const ceilingPrice = getCelling(symbolCode);
        const tickSize = getTickSize(symbolCode);
        const price = convertNumber(value);
        setPrice(price);
        if (ceilingPrice === 0 && floorPrice === 0) {
            setIsShowNotiErrorPrice(false);
            return;
        }
        if (+price > ceilingPrice) {
            setIsShowNotiErrorPrice(true);
        } else if (+price < floorPrice) {
            setIsShowNotiErrorPrice(true);
        } else {
            setIsShowNotiErrorPrice(false);
        }
        const temp = Math.round(+price * 100);
        const tempTickeSize = Math.round(tickSize * 100);
        setInvalidPrice(temp % tempTickeSize !== 0);
    }

    const _renderNotiErrorPrice = () => (
        <div className='text-danger text-end'>Out of daily price limits</div>
    )

    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => (
        <>
            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                <div className="flex-grow-1 py-1 px-2" onKeyDown={handleKeyDown}>
                    <label className="text text-secondary" style={{ float: 'left' }}>{title}</label>
                    <NumberFormat disabled={disableControl()} decimalScale={title === TITLE_ORDER_CONFIRM.PRICE ? 2 : 0} type="text" className="form-control text-end border-0 p-0 fs-5 lh-1 fw-600"
                        value={convertNumber(value) === 0 ? '' : formatCurrency(value)}
                        thousandSeparator="," isAllowed={(e) => handleAllowedInput(e.value, isAllowed)}
                        onValueChange={title === TITLE_ORDER_CONFIRM.PRICE ? (e: any) => handleChangePrice(e.value) : (e: any) => handleChangeVolume(e.value)}
                    />
                </div>
                <div className="border-start d-flex flex-column">
                    <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperValue}>+</button>
                    <button type="button" className="btn px-2 py-1 flex-grow-1" onClick={handleLowerValue}>-</button>
                </div>
            </div>
            {isShowNotiErrorPrice && title === TITLE_ORDER_CONFIRM.PRICE && _renderNotiErrorPrice()}
            {invalidPrice && convertNumber(value) !== 0 && title === TITLE_ORDER_CONFIRM.PRICE && <div className='text-danger text-end'>Invalid Price</div>}
            {invalidVolume && convertNumber(value) !== 0 && title === TITLE_ORDER_CONFIRM.VOLUME && <div className='text-danger text-end'>Invalid quantity</div>}
        </>

    )

    const handelUpperVolume = () => {
        if (ticker) {
            const symbolCode = ticker.split('-')[0]?.trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.symbolCode === symbolCode);
            if (item) {
                const lotSize = convertNumber(item.lotSize) === 0 ? 1 : convertNumber(item.lotSize);
                const currentVol = Number(volume);
                const nerwVol = currentVol + lotSize;
                setVolume(nerwVol);
                setInvalidVolume(nerwVol % lotSize !== 0);
            }
        }
    }

    const handelLowerVolume = () => {
        if (ticker) {
            const symbolCode = ticker.split('-')[0]?.trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.symbolCode === symbolCode);
            if (item) {
                const lotSize = convertNumber(item.lotSize) === 0 ? 1 : convertNumber(item.lotSize);
                const currentVol = Number(volume);
                if (currentVol <= lotSize) {
                    setVolume(lotSize);
                    return;
                }
                const nerwVol = currentVol - lotSize;
                setVolume(nerwVol);
                setInvalidVolume(nerwVol % lotSize !== 0);
            }
        }
    }

    const handleUpperPrice = () => {
        if (ticker) {
            const symbolCode = ticker.split('-')[0]?.trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.symbolCode === symbolCode);
            if (item) {
                const floorPrice = item.floor;
                const ceilingPrice = item.ceiling;
                const tickSize = item && convertNumber(item.tickSize) !== 0 ? convertNumber(item.tickSize) : 1;
                const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
                const currentPrice = Number(price);
                let newPrice = calcPriceIncrease(currentPrice, tickSize, decimalLenght);
                setPrice(newPrice);
                const temp = Math.round(Number(newPrice) * 100);
                const tempTickeSize = Math.round(tickSize * 100);
                setInvalidPrice(temp % tempTickeSize !== 0);
                if (newPrice > ceilingPrice) {
                    setIsShowNotiErrorPrice(true);
                    return;
                }
                if (newPrice < floorPrice) {
                    setIsShowNotiErrorPrice(true);
                    return;
                }
                setIsShowNotiErrorPrice(false);
            }
        }
    }

    const handleLowerPrice = () => {
        if (ticker) {
            const symbolCode = ticker.split('-')[0]?.trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.symbolCode === symbolCode);
            if (item) {
                const floorPrice = item.floor;
                const ceilingPrice = item.ceiling;
                const currentPrice = Number(price);
                const tickSize = item && convertNumber(item.tickSize) !== 0 ? convertNumber(item.tickSize) : 1;
                const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
                let newPrice = calcPriceDecrease(currentPrice, tickSize, decimalLenght);
                if (newPrice > 0) {
                    setPrice(newPrice);
                }
                const temp = Math.round(Number(newPrice) * 100);
                const tempTickeSize = Math.round(tickSize * 100);
                setInvalidPrice(temp % tempTickeSize !== 0);
                if (newPrice > ceilingPrice) {
                    setIsShowNotiErrorPrice(true);
                    return;
                }
                if (newPrice < floorPrice) {
                    setIsShowNotiErrorPrice(true);
                    return;
                }
                setIsShowNotiErrorPrice(false);
            }
        }
    }

    const handleChangeTicker = (event: any) => {
        const value = event.target.innerText || event.target.value;
        setTicker(value ? value : '');
        if (value) {
            const symbolCode = value?.split('-')[0]?.trim();
            const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const symbolItem = symbolInfor.find(item => item.symbolCode === symbolCode);
            const item = symbols.find(o => o?.symbolCode === symbolCode);
            if (item) {
                convertNumber(symbolItem?.lastPrice) === 0 ? setPrice(convertNumber(symbolItem?.prevClosePrice)) : setPrice(convertNumber(symbolItem?.lastPrice));
                setVolume(convertNumber(item.lotSize));
                setInvalidPrice(false);
                setInvalidVolume(false);
                setIsShowNotiErrorPrice(false);
            }
        } else {
            setPrice(0);
            setVolume(0);
        }
        
    }

    const disableControl = () => {
        return ticker?.trim() === '';
    }

    const renderSymbolSelect = () => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const lstStr: string[] = [];
        symbols.forEach(item => {
            lstStr.push(`${item.symbolCode} - ${item.symbolName}`);
        });
        return <Autocomplete
            className='ticker-input w-100'
            onChange={(event: any) => handleChangeTicker(event)}
            onKeyUp={(event: any) => handleChangeTicker(event)}
            disablePortal
            sx={{ width: 400 }}
            value={ticker}
            options={lstStr}
            renderInput={(params) => <TextField {...params} placeholder="Search Ticker" />}
        />
    }

    const disableButtonPlace = () => {
        return (ticker === '' || price === 0 || volume === 0 || invalidPrice || invalidVolume || isShowNotiErrorPrice || !currentSide);
    }

    const handlePlaceOrder = () => {
        const tickerCode = ticker.split('-')[0]?.trim();
        const obj: ISymbolMultiOrder = {
            no: listTickers.length > 0 ? (convertNumber(listTickers[listTickers.length - 1].no) + 1).toString() : '0',
            orderSide: sideAddNew,
            price: price.toString(),
            volume: volume.toString(),
            ticker: tickerCode,
            msgCode: getStatusOrder(tickerCode, volume, price) ? 
                getStatusOrder(tickerCode, volume, price)?.msgCode : null,
            message: getStatusOrder(tickerCode, volume, price) ? 
                getStatusOrder(tickerCode, volume, price)?.message : ''
        }

        const tmp = [...listTickers];
        tmp.push(obj);
        setListTickers(tmp);
        dispatch(keepListOrder(tmp));
        setIsAddOrder(false);
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]')
        const symbol = symbols.find(symbol => symbol.symbolCode === ticker?.split('-')[0]?.trim())
        setPrice(symbol ? symbol.floor : 0);
        setVolume(symbol ? symbol.lotSize : 0);
    }

    const defindStatusOrder = (order: ISymbolMultiOrder) => {
        if (order.state === tradingModelPb.OrderState.ORDER_STATE_PLACED) {
            return <div title={STATUS_ORDER.success} className="text-success text-truncate">{STATUS_ORDER.success}</div>
        }
        return <div title={order.status?.toUpperCase()} className="text-danger text-truncate">{order?.status?.toUpperCase()}</div>;
    }

    const _renderOrderForm = () => (
        <div className="popup-box multiple-Order" >
            <div className="box d-flex">
                <div className="col-6">Add Order
                </div>
                <div className="col-6 text-end"><span className="close-icon" onClick={() => {
                    setIsAddOrder(false);
                    setTicker('');
                }}>x</span></div>
            </div>
            <div className='content text-center' style={{ height: '600px' }}>
                <form action="#" className="order-form p-2 border shadow my-3" noValidate={true}>
                    <div className="order-btn-group d-flex align-items-stretch mb-2">
                        {_renderButtonSideOrder(currentSide, 'btn-buy', 'Sell', 'Sell', 'selected', '')}
                        <span className='w-2'></span>
                        {_renderButtonSideOrder(currentSide, 'btn-sell', 'Buy', 'Buy', '', 'selected')}
                    </div>
                    <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                        <label className="text text-secondary mr-10">Ticker</label>
                        <div className="fs-18 mr-3 flex-fill">
                            {renderSymbolSelect()}
                        </div>
                    </div>


                    {_renderInputControl(TITLE_ORDER_CONFIRM.PRICE, price.toString(), handleUpperPrice, handleLowerPrice)}
                    {_renderInputControl(TITLE_ORDER_CONFIRM.QUANLITY, volume.toString(), handelUpperVolume, handelLowerVolume)}

                    <div className="border-top">

                        <button className="btn btn-placeholder btn-primary-custom d-block fw-bold text-white mb-1 w-100"
                            disabled={disableButtonPlace()}
                            onClick={handlePlaceOrder} >Save</button>
                    </div>
                </form>
            </div>
        </div>
    )

    const _renderPopupConfirm = () => {
        return <div className="popup-box multiple-Order" >
            <div className="box d-flex" style={{ width: '40%' }}>
                <div className="col-6">Multiple Orders</div>
                <div className="col-6 text-end"><span className="close-icon position-close-popup" onClick={() => setShowModalConfirmMultiOrders(false)}>x</span></div>
            </div>
            <div className='content text-center' style={{ width: '40%' }}>
                <div className="table table-responsive mh-500 tableFixHead">
                    <table className="table table-sm table-hover mb-0 dataTable no-footer">
                        <thead>
                            {_renderHearderMultipleOrdersConfirm()}
                        </thead>
                        <tbody>
                            {_renderDataMultipleOrdersConfirm()}
                        </tbody>
                    </table>
                </div>


                <div className="text-end mb-3 mt-10">
                    <a href="#" className="btn btn-outline-secondary btn-clear mr-10" onClick={(e) => setShowModalConfirmMultiOrders(false)}>Close</a>
                    <a href="#" className="btn btn-primary btn-submit" onClick={callOrderRequest}>Submit</a>
                </div>
            </div>
        </div>
    }

    const onInputClick = ( event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        const element = event.target as HTMLInputElement
        element.value = ''
    }

    const _renderElementImport = () => (
        <div className="border-1 mt-30 mr mb-30" style={{width: "350px"}}>
            <div className="header-import">
                <span className="m-3">Import</span>
            </div>
            <div className='text-center mt-30'>
                <div>
                    <img src={ICON_FILE} className="img-responsive" alt="Image" />
                </div>
                <span className="label text-nowrap mb-3 fw-600">Select a CSV file to import</span>
                <div className="mb-30 mt-30">
                    <div className="upload-btn-wrapper">
                        <button className="btn btn-upload">Import File</button>
                        <input type="file" name="myfile" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} onClick={onInputClick} />
                    </div>
                </div>
            </div>
        </div>
    )
    const _renderDataTableListOrder = () => (
        <div className="card-modify mb-3">
            <div className="card-body p-0 mb-3 table table-responsive mh-500 tableFixHead">
                <form noValidate={true}>
                    <table className="table table-sm table-hover mb-0 dataTable no-footer">
                        <thead>
                            {_renderHearderMultipleOrders()}
                        </thead>
                        <tbody>
                            {_renderDataMultipleOrders()}
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    )
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Multiple Orders</h6>
                </div>


                <div className="d-flex justify-content-sm-between m-3">
                    <div className="d-flex">
                        <button type="button" className="btn btn-warning" onClick={() => setIsAddOrder(true)}>Add Order</button>
                        {listTickers.length === 0 && <div className="upload-btn-wrapper">
                            <a href={FILE_MULTI_ORDER_SAMPLE} className="btn btn-upload" title={"template file"} download="MultiOrdersSample.csv"> Download</a>
                        </div>}
                        {listTickers.length > 0 && <div className="upload-btn-wrapper">
                            <button className="btn btn-upload">Import</button>
                            <input type="file" name="myfile" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} onClick={onInputClick} />
                        </div>}

                    </div>
                    {listSelected.length > 0 &&
                        <div className="d-flex">
                            <button type="button" className="btn btn-danger ml-4" onClick={deleteRecord}>Delete</button>
                            <div className="d-flex">
                                <button type="button" className="btn btn-warning  ml-4">{listSelected.length} Selected</button>
                                <button type="button" className="btn btn-primary" style={{ marginLeft: '5px' }} onClick={showScreenConfirmOrder}>Execute</button>
                            </div>
                        </div>
                    }
                </div>
                {listTickers.length === 0 && _renderElementImport()}
                {listTickers.length > 0 && _renderDataTableListOrder()}

            </div>
        </div>
        {showModalConfirmMultiOrders && _renderPopupConfirm()}
        {isAddOrder && _renderOrderForm()}
    </div>

};
export default MultipleOrders;