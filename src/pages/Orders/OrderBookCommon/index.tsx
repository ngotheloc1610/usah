import { useEffect, useState } from 'react';
import OrderForm from '../../../components/Order/OrderForm';
import OrderBookList from '../../../components/Orders/OrderBookCommon/OrderBookList';
import OrderBookTickerDetail from '../../../components/Orders/OrderBookCommon/OrderBookTickerDetail';
import OrderBookTradeHistory from '../../../components/Orders/OrderBookCommon/OrderBookTradeHistory';
import { STYLE_LIST_BIDS_ASK } from '../../../constants/order.constant';
import { IAskAndBidPrice, IListTradeHistory, IStyleBidsAsk, ISymbolInfo, ISymbolQuote, ITickerInfo } from '../../../interfaces/order.interface';
import { ILastQuote } from '../../../interfaces/order.interface';
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as tmpb from "../../../models/proto/trading_model_pb"
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './OrderBookCommon.scss';
import * as qspb from "../../../models/proto/query_service_pb";
import * as tspb from "../../../models/proto/trading_service_pb";
import { SOCKET_CONNECTED, LIST_TICKER_INFO, ACCOUNT_ID, LIST_PRICE_TYPE, SOCKET_RECONNECTED } from '../../../constants/general.constant';
import { ITickerDetail } from '../../../interfaces/ticker.interface';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DEFAULT_CURRENT_TICKER, DEFAULT_DATA_TICKER, DEFAULT_STYLE_LAYOUT, DEFAULT_TICKER_INFO } from '../../../mocks';
import { IQuoteEvent } from '../../../interfaces/quotes.interface';
import { assignListPrice, calcChange, calcPctChange, checkValue, getSymbolCode, toTimestamp } from '../../../helper/utils';
import { useDispatch, useSelector } from 'react-redux';
import { chooseLayoutOrderBook } from '../../../redux/actions/User'

const OrderBookCommon = () => {
    // State nhận nhiều kiểu dữ liệu nên sẽ khai báo là any
    let styleLayout = useSelector((state: any) => state.user.layoutOrderBook);
    if (!styleLayout?.columns && !styleLayout?.columnsGap && !styleLayout?.earmarkSpreadSheet && !styleLayout?.grid && !styleLayout?.spreadsheet) {
        styleLayout = {
            columns: true,
            columnsGap: false,
            earmarkSpreadSheet: false,
            grid: false,
            spreadsheet: false
        }
    }
    
    const dispatch = useDispatch();
    const [isEarmarkSpreadSheet, setEarmarkSpreadSheet] = useState<boolean>(styleLayout?.earmarkSpreadSheet);
    const [isSpreadsheet, setSpreadsheet] = useState<boolean>(styleLayout?.spreadsheet);
    const [isGrid, setGrid] = useState<boolean>(styleLayout?.grid);
    const [isColumns, setColumns] = useState<boolean>(styleLayout?.columns);
    const [isColumnsGap, setColumnsGap] = useState<boolean>(styleLayout?.columnsGap);
    const [tradeHistory, setTradeHistory] = useState<IListTradeHistory[]>([]);
    const [currentTicker, setCurrentTicker] = useState<ITickerInfo | any>(DEFAULT_CURRENT_TICKER);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolId, setSymbolId] = useState<number>(0);
    const [itemTickerInfor, setItemTickerInfor] = useState<ISymbolInfo>();
    const [listTicker, setListTicker] = useState<ISymbolInfo[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]'))
    const [itemTickerDetail, setItemTickerDetail] = useState<ILastQuote>(DEFAULT_DATA_TICKER);
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [quoteEvent, setQuoteEvent] = useState([]);
    const [tickerSelect, setTickerSelect] = useState('');
    const [tradeEvent, setTradeEvent] = useState([]);
    const [symbolSearch, setSymbolSearch] = useState('');
    const [quoteInfo, setQuoteInfo] = useState<IAskAndBidPrice>();
    const [side, setSide] = useState(0);
    const [listStyleBidsAsk, setListStyleBidsAsk] = useState(DEFAULT_STYLE_LAYOUT);

    const year = new Date().getFullYear();
    // TODO: getMonth() return start 0 -> 11. We should +1 to convert timestamp
    const month = new Date().getMonth() + 1;
    const date = new Date().getDate();
    const timeFrom = toTimestamp(`${month}/${date}/${year} 00:00:00`);
    const timeTo = toTimestamp(`${month}/${date}/${year} 23:59:59`);

    const defaultData = () => {
        setEarmarkSpreadSheet(false);
        setSpreadsheet(false);
        setGrid(false);
        setColumns(false);
        setColumnsGap(false);
    }

    useEffect(() => {
        const listStyleBidsAsk: IStyleBidsAsk = {
            earmarkSpreadSheet: isEarmarkSpreadSheet,
            spreadsheet: isSpreadsheet,
            grid: isGrid,
            columns: isColumns,
            columnsGap: isColumnsGap,
        };
        setListStyleBidsAsk(listStyleBidsAsk);
        dispatch(chooseLayoutOrderBook(listStyleBidsAsk));

    }, [isEarmarkSpreadSheet, isSpreadsheet, isGrid, isColumns, isColumnsGap])

    useEffect(() => searchTicker(), [itemTickerInfor])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                getOrderBooks();
                const listSymbolCode: string[] = [];
                listTicker.forEach((item: ISymbolInfo) => {
                    listSymbolCode.push(`${item.symbolCode} - ${item.symbolName}`);
                });
                setListSymbolCode(listSymbolCode);
                getTickerSearch(listSymbolCode[0]);
                assignTickerToOrderForm(listSymbolCode[0]);
            }
        });

        const renderDataToScreen = wsService.getTradeHistory().subscribe(res => {
            setTradeHistory(res.tradeList);
        });

        const unsubscribeQuote = wsService.getUnsubscribeQuoteSubject().subscribe(resp => {
            if (resp.msgText === "SUCCESS") {
                if (symbolSearch !== '') {
                    subscribeQuoteEvent(symbolSearch);
                }
            }
        });

        const unsubscribeTrade = wsService.getUnsubscribeTradeSubject().subscribe(resp => {
        });

        const subscribeTradeRes = wsService.getSubscribeTradeSubject().subscribe(resp => {
        });

        const subscribeQuote = wsService.getSubscribeQuoteSubject().subscribe(resp => {
        });

        const quotes = wsService.getQuoteSubject().subscribe(resp => {
            if (resp && resp.quoteList) {
                setQuoteEvent(resp.quoteList);
            }
        });

        const trade = wsService.getTradeEvent().subscribe(trades => {
            if (trades && trades.tradeList) {
                setTradeEvent(trades.tradeList);
            }
        })

        return () => {
            unSubscribeQuoteEvent(symbolSearch);
            unsubscribeTradeEvent(symbolSearch);
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
            unsubscribeQuote.unsubscribe();
            subscribeQuote.unsubscribe();
            quotes.unsubscribe();
            unsubscribeTrade.unsubscribe();
            subscribeTradeRes.unsubscribe();
            trade.unsubscribe();
        }
    }, []);

    useEffect(() => {
        processQuotes(quoteEvent);
    }, [quoteEvent])

    useEffect(() => {
        processTradeEvent(tradeEvent);
    }, [tradeEvent])

    const assignTickerToOrderForm = (symbolCode: string) => {
        const element = listTicker.find(o => o?.symbolCode === symbolCode);
        const tradingModelPb: any = tmpb
        if (element) {
            const itemTicker = {
                tickerName: element?.symbolName,
                ticker: element?.symbolCode,
                lastPrice: '0',
                volume: '0',
                side: tradingModelPb.OrderType.OP_SELL,
                symbolId: element.symbolId
            }
            setCurrentTicker(itemTicker);
        }
    }

    const processTradeEvent = (trades: IListTradeHistory[]) => {
        const tmp = [...tradeHistory];
        trades.forEach(item => {
            tmp.unshift(item);
        });
        setTradeHistory(tmp);
    }

    const processQuotes = (quotes: IQuoteEvent[]) => {
        const quote = quotes.find(o => o?.symbolCode === itemTickerDetail?.symbolCode);
        if (quote) {
            const tmpItem: ILastQuote = {
                asksList: assignListPrice(itemTickerDetail.asksList, quote.asksList, LIST_PRICE_TYPE.askList),
                bidsList: assignListPrice(itemTickerDetail.bidsList, quote.bidsList, LIST_PRICE_TYPE.bidList),
                close: checkValue(itemTickerDetail.close, quote.close),
                currentPrice: checkValue(itemTickerDetail.currentPrice, quote.currentPrice),
                high: checkValue(itemTickerDetail.high, quote.high),
                low: checkValue(itemTickerDetail.low, quote.low),
                netChange: assignChangeValue(itemTickerDetail, quote).toFixed(2),
                open: checkValue(itemTickerDetail.open, quote.open),
                pctChange: assignPctChangeValue(itemTickerDetail, quote).toFixed(2),
                quoteTime: checkValue(itemTickerDetail.quoteTime, quote.quoteTime),
                scale: checkValue(itemTickerDetail.scale, quote.scale),
                symbolCode: itemTickerDetail.symbolCode,
                symbolId: itemTickerDetail.symbolId,
                tickPerDay: checkValue(itemTickerDetail.tickPerDay, quote.tickPerDay),
                volumePerDay: checkValue(itemTickerDetail.volumePerDay, quote.volumePerDay),
                volume: checkValue(itemTickerDetail.volume, quote.volumePerDay),
                ticker: itemTickerDetail.ticker,
            }
            setItemTickerDetail(tmpItem);
        }

    }

    const assignChangeValue = (tickerInfo: ILastQuote, quote: IQuoteEvent) => {
        const lastPrice = checkValue(tickerInfo.currentPrice, quote.currentPrice);
        const open = checkValue(tickerInfo.open, quote.open);
        return calcChange(lastPrice, open);
    }

    const assignPctChangeValue = (tickerInfo: ILastQuote, quote: IQuoteEvent) => {
        const lastPrice = checkValue(tickerInfo.currentPrice, quote.currentPrice);
        const open = checkValue(tickerInfo.open, quote.open);
        return calcPctChange(lastPrice, open);
    }

    const getTradeHistory = (symbolCode: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();
            tradeHistoryRequest.setSymbolCode(symbolCode);
            tradeHistoryRequest.setFromDatetime(timeFrom);
            tradeHistoryRequest.setToDatetime(timeTo);
            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleDataFromWs = () => {
        wsService.getDataLastQuotes().subscribe(response => {
            const tickerDetail = response.quotesList.find((item: ILastQuote) => Number(item.symbolCode) === Number(symbolId));
            setItemTickerDetail(tickerDetail);
        });
    }

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();
            listTicker.forEach(item => {
                lastQuotesRequest.addSymbolCode(item.symbolCode)
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const selectedStyle = (item: string) => {
        defaultData();
        switch (item) {
            case STYLE_LIST_BIDS_ASK.earmarkSpreadSheet: {
                setEarmarkSpreadSheet(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.spreadsheet: {
                setSpreadsheet(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.grid: {
                setGrid(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.columns: {
                setColumns(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.columnsGap: {
                setColumnsGap(true);
                break;
            }
        }
    }

    const _renderListStyle = (isStyle: boolean, itemStyle: string) => (
        <li>
            <a href="#layout-1"
                className={`btn btn-sm btn-outline-secondary mx-1 ${isStyle ? 'selected' : ''}`}
                onClick={() => selectedStyle(itemStyle)}>
                <i className={`bi bi-${itemStyle}`}></i></a>
        </li>
    )

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
    }

    const getTickerSearch = (value: string) => {
        const symbolCode = value !== undefined ? getSymbolCode(value) : '';
        setSymbolSearch(symbolCode);
        setTickerSelect(symbolCode);
        assignTickerToOrderForm(symbolCode);
        const itemTickerInfor = listTicker.find(item => item.symbolCode === symbolCode.toUpperCase());

        if (symbolSearch) {
            unSubscribeQuoteEvent(itemTickerInfor?.symbolCode || '');
            unsubscribeTradeEvent(itemTickerInfor?.symbolCode || '');
        }
        subscribeQuoteEvent(itemTickerInfor?.symbolCode || '');
        subscribeTradeEvent(itemTickerInfor?.symbolCode || '');
        getTradeHistory(itemTickerInfor?.symbolCode || '');
        setSymbolSearch(itemTickerInfor?.symbolCode || '');
        setItemTickerInfor(itemTickerInfor);
        setSymbolId(itemTickerInfor ? itemTickerInfor.symbolId : 0);
    }

    const searchTicker = () => {
        if (symbolId !== 0) {
            getOrderBooks();
            handleDataFromWs();
            return;
        }
        setItemTickerDetail(DEFAULT_DATA_TICKER);
    }

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            const symbolCode = event.target.value ? getSymbolCode(event.target.value) : '';
            const itemTickerInfor = listTicker.find(item => item.symbolCode === symbolCode);
            setSymbolSearch(symbolCode);
            setTickerSelect(symbolCode);
            setItemTickerInfor(itemTickerInfor);
            setSymbolId(itemTickerInfor ? itemTickerInfor.symbolId : 0);
            getTickerSearch(symbolCode)
            searchTicker()
        }
    }

    const assgnDataFormNewOrder = (item: IAskAndBidPrice) => {
        const assTickerInfor = itemTickerInfor;
        const itemTicker = {
            tickerName: assTickerInfor?.symbolName,
            ticker: assTickerInfor?.symbolCode,
            lastPrice: item.price === '-' ? '0' : item.price,
            volume: item.volume === '-' ? '0' : item.volume,
            side: item.side,
            symbolId: assTickerInfor?.symbolId
        }

        const temp: IAskAndBidPrice = {
            numOrders: item.numOrders,
            price: item.price,
            tradable: item.tradable,
            volume: item.volume,
            symbolCode: assTickerInfor?.symbolCode
        }

        setQuoteInfo(temp);

        setTickerSelect(itemTicker.ticker || '')
        setCurrentTicker(itemTicker);
    }

    const subscribeTradeEvent = (symbolCode: string) => {
        const tradingServicePb: any = tspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeTradeEvent = new tradingServicePb.SubscribeTradeEventRequest();
            subscribeTradeEvent.addSymbolCode(symbolCode);
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_TRADE_REQ);
            rpcMsg.setPayloadData(subscribeTradeEvent.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const unsubscribeTradeEvent = (symbolCode: string) => {
        const tradingServicePb: any = tspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeTradeEventReq = new tradingServicePb.UnsubscribeTradeEventRequest();
            unsubscribeTradeEventReq.addSymbolCode(symbolCode);
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_TRADE_REQ);
            rpcMsg.setPayloadData(unsubscribeTradeEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }


    const subscribeQuoteEvent = (symbolCode: string) => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            subscribeQuoteEventReq.addSymbolCode(symbolCode);
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const unSubscribeQuoteEvent = (symbolId: string) => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            unsubscribeQuoteReq.addSymbolCode(symbolId);
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const _renderTemplateSearchTicker = () => {
        return <div className="row g-2 justify-content-end">
            <div className="col-md-3">
                <div className="input-group input-group-sm mb-2">
                    <Autocomplete
                        onChange={(event: any) => getTickerSearch(event.target.innerText)}
                        onKeyUp={handleKeyUp}
                        disablePortal
                        options={listSymbolCode}
                        defaultValue={`${listTicker[0].symbolCode} - ${listTicker[0].symbolName}`}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} placeholder="Search" />}
                    />
                </div>
            </div>
        </div>
    }

    const getSide = (value: number) => {
        setSide(value);
    }

    const _renderTemplateOrderBookCommon = () => (
        <div className="site-main">
            <div className="container">
                <div className="row g-2 align-items-center">
                    <div className="col-md-9">
                        {_renderTemplateSearchTicker()}
                    </div>
                    <div className="col-md-3">
                        <ul className="idTabs nav align-items-center justify-content-center mb-2">
                            {_renderListStyle(isEarmarkSpreadSheet, STYLE_LIST_BIDS_ASK.earmarkSpreadSheet)}
                            {_renderListStyle(isSpreadsheet, STYLE_LIST_BIDS_ASK.spreadsheet)}
                            {_renderListStyle(isGrid, STYLE_LIST_BIDS_ASK.grid)}
                            {_renderListStyle(isColumns, STYLE_LIST_BIDS_ASK.columns)}
                            {_renderListStyle(isColumnsGap, STYLE_LIST_BIDS_ASK.columnsGap)}
                        </ul>
                    </div>
                </div>
                <div className="row align-items-stretch g-2">
                    <div className="col-md-9">
                        <div className="equal-target">
                            <div id="layout-1">
                                <div className="row align-items-stretch g-2">
                                    <div className="col-md-9">
                                        <OrderBookList styleListBidsAsk={listStyleBidsAsk} symbolCode={tickerSelect} handleSide={getSide} getTicerLastQuote={assgnDataFormNewOrder} />
                                        <div className="card card-ticker w-pr-100">
                                            <OrderBookTickerDetail symbolCode={tickerSelect} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card card-new-order d-flex flex-column mb-2 h-100">
                                            <div className="card-header">
                                                <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                            </div>
                                            <div className="card-body">
                                                <OrderForm isOrderBook={true} quoteInfo={quoteInfo} side={side} isDashboard={false} symbolCode={tickerSelect} messageSuccess={messageSuccess} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <OrderBookTradeHistory getDataTradeHistory={tradeHistory} symbolCode={tickerSelect} />
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderTemplateOrderBookCommon()}</>
};
export default OrderBookCommon;