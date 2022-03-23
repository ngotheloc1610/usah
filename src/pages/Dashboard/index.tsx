import { useEffect, useRef, useState } from "react";
import OrderBook from "../../components/Order/OrderBook";
import OrderForm from "../../components/Order/OrderForm";
import TickerDashboard from "../../components/TickerDashboard";
import { ACCOUNT_ID, DEFAULT_TIME_ZONE, FROM_DATE_TIME, LIST_TICKER_INFO, MESSAGE_TOAST, SOCKET_CONNECTED, TO_DATE_TIME } from "../../constants/general.constant";
import { IAskAndBidPrice, ILastQuote, IListTradeHistory, IPortfolio, ISymbolInfo, ISymbolQuote, ITickerInfo } from "../../interfaces/order.interface";
import './Dashboard.scss';
import { wsService } from "../../services/websocket-service";
import * as rspb from "../../models/proto/rpc_pb";
import * as pspb from '../../models/proto/pricing_service_pb';
import * as qspb from '../../models/proto/query_service_pb';
import * as tspb from "../../models/proto/trading_service_pb";
import * as sspb from "../../models/proto/system_service_pb"
import StockInfo from "../../components/Order/StockInfo";
import moment from "moment";
import 'moment-timezone';
import { checkValue, convertDatetoTimeStamp, convertNumber, formatCurrency, formatNumber } from "../../helper/utils";
import { IQuoteEvent } from "../../interfaces/quotes.interface";

const Dashboard = () => {
    const isDashboard = true;
    const [symbolCode, setSymbolCode] = useState('');
    const [msgSuccess, setMsgSuccess] = useState<string>('');

    const [handleSymbolList, sethandleSymbolList] = useState<ITickerInfo[]>([]);
    const [dataSearchTicker, setDataSearchTicker] = useState<ILastQuote>();
    const [listTickerSearch, setListTickerSearch] = useState<string[]>([]);
    const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);

    const [side, setSide] = useState(0);
    const [symbolList, setSymbolList] = useState<ISymbolInfo[]>([]);
    const [symbolQuote, setSymbolQuote] = useState<ISymbolQuote>();
    const [quoteInfo, setQuoteInfo] = useState<IAskAndBidPrice>()

    const [matchedOrder, setMatchedOrder] = useState(0);
    const [pendingOrder, setPendingOrder] = useState(0);
    const [trade, setTrade] = useState<IListTradeHistory[]>([])
    const [tradeEvent, setTradeEvent] = useState<IListTradeHistory[]>([])
    const [portfolio, setPortfolio] = useState<IPortfolio[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);

    const usTime: any = useRef();
    const zoneTime: any = useRef();

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                callSymbolListRequest();
                sendTradeHistoryReq();
                sendListOrder();
                sendAccountPortfolio();
            }
        });
        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            if (res.symbolList) {
                setSymbolList(res.symbolList);
                if (res.symbolList.length > 0) {
                    localStorage.setItem(LIST_TICKER_INFO, JSON.stringify(res.symbolList));
                    const temps: string[] = [];
                    res.symbolList.forEach(item => {
                        if (item) {
                            temps.push(item?.symbolCode);
                        }
                    });
                    setListTickerSearch(temps);
                }
                if (res.symbolList[0]) {
                    setSymbolCode(res.symbolList[0]?.symbolCode || '');
                }
                subscribeQuoteEvent(res.symbolList);
                callLastQuoteRequest(res.symbolList)
                subscribeTradeEvent(res.symbolList);
            }
        });

        const tradeHistoryRes = wsService.getTradeHistory().subscribe(res => {
            if (res && res.tradeList) {
                setTrade(res.tradeList)
                setMatchedOrder(res.tradeList.length)
            }
        });

        const trade = wsService.getTradeEvent().subscribe(trades => {
            if (trades && trades.tradeList) {
                setTradeEvent(trades.tradeList);
            }
        })

        const listOrder = wsService.getListOrder().subscribe(res => {
            if (res && res.orderList) {
                setPendingOrder(res.orderList.length)
            }
        });

        const portfolioRes = wsService.getAccountPortfolio().subscribe(res => {
            if (res && res.accountPortfolioList) {
                setPortfolio(res.accountPortfolioList);
            }
        });

        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setLastQuotes(quote.quotesList);
            }
        })

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
            tradeHistoryRes.unsubscribe();
            unsubscribeTradeEvent(symbolList);
            listOrder.unsubscribe();
            trade.unsubscribe();
            portfolioRes.unsubscribe();
            quoteEvent.unsubscribe();
            lastQuote.unsubscribe();
        }
    }, [])

    useEffect(() => {
        setMatchedOrder(matchedOrder + 1)
    }, [tradeEvent])

    useEffect(() => {
        processLastQuote(lastQuotes, portfolio);
    }, [lastQuotes]);

    useEffect(() => {
        processQuoteEvent(quoteEvent, portfolio);
    }, [quoteEvent]);

    const processLastQuote = (lastQuotes: ILastQuote[] = [], portfolio: IPortfolio[] = []) => {
        if (portfolio) {
            const temp = [...portfolio];
            lastQuotes.forEach(item => {
                if (item) {
                    const idx = temp?.findIndex(o => o?.symbolCode === item?.symbolCode);
                    if (idx >= 0) {
                        temp[idx] = {
                            ...temp[idx],
                            marketPrice: item?.currentPrice
                        }
                    }
                }
            });
            setPortfolio(temp);
        }
    }

    const processQuoteEvent = (quoteEvent: IQuoteEvent[] = [], portfolio: IPortfolio[] = []) => {
        if (portfolio) {
            const temp = [...portfolio];
            quoteEvent.forEach(item => {
                if (item) {
                    const idx = temp?.findIndex(o => o?.symbolCode === item?.symbolCode);
                    if (idx >= 0) {
                        temp[idx] = {
                            ...temp[idx],
                            marketPrice: checkValue(temp[idx]?.marketPrice, item?.currentPrice)
                        }
                    }
                }
            })
            setPortfolio(temp);
        }
    }

    useEffect(() => {
        const timer = setInterval(() => handleUsTime(), 1000);

        return () => clearTimeout(timer);
    }, [timeZone]);

    useEffect(() => {
        const timer = setInterval(() => handleSetTimeZone(), 1000);

        return () => clearTimeout(timer);
    }, [timeZone]);

    const sendTradeHistoryReq = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        const today = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-${new Date().getDate()}`;

        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();
            tradeHistoryRequest.setAccountId(Number(accountId));
            tradeHistoryRequest.setFromDatetime(convertDatetoTimeStamp(today, FROM_DATE_TIME))
            tradeHistoryRequest.setToDatetime(convertDatetoTimeStamp(today, TO_DATE_TIME))
            const rpcPb: any = rspb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendListOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();

            orderRequest.setAccountId(accountId);
            rpcMsg.setPayloadData(orderRequest.serializeBinary());
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendAccountPortfolio = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        const systemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let accountPortfolioRequest = new systemServicePb.AccountPortfolioRequest();
            accountPortfolioRequest.addAccountId(Number(accountId));
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_PORTFOLIO_REQ);
            rpcMsg.setPayloadData(accountPortfolioRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const subscribeQuoteEvent = (symbols: ILastQuote[]) => {
        const pricingServicePb: any = pspb;
        const rpc: any = rspb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            symbols.forEach(item => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const callSymbolListRequest = () => {
        const accountId = localStorage.getItem(ACCOUNT_ID);
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let symbolListRequest = new queryServicePb.SymbolListRequest();
            symbolListRequest.setAccountId(Number(accountId));

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.SYMBOL_LIST_REQ);
            rpcMsg.setPayloadData(symbolListRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const callLastQuoteRequest = (symbolList: ILastQuote[]) => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();
            symbolList.forEach(item => {
                lastQuotesRequest.addSymbolCode(item.symbolCode)
            });
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const subscribeTradeEvent = (symbolList: ISymbolInfo[]) => {
        const tradingServicePb: any = tspb;
        const rpc: any = rspb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeTradeEvent = new tradingServicePb.SubscribeTradeEventRequest();
            symbolList.forEach(item => {
                if (item) {
                    subscribeTradeEvent.addSymbolCode(item.symbolCode)
                }
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_TRADE_REQ);
            rpcMsg.setPayloadData(subscribeTradeEvent.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const unsubscribeTradeEvent = (symbolList: ISymbolInfo[]) => {
        const tradingServicePb: any = tspb;
        const rpc: any = rspb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeTradeEventReq = new tradingServicePb.UnsubscribeTradeEventRequest();
            symbolList.forEach(item => {
                unsubscribeTradeEventReq.addSymbolCode(item.symbolCode)
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_TRADE_REQ);
            rpcMsg.setPayloadData(unsubscribeTradeEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleUsTime = () => {
        if (usTime.current) {
            usTime.current.innerText = moment.tz(moment(), "America/New_York").format('LTS');
        }
    }

    const handleSetTimeZone = () => {
        let time: string = '';
        timeZone === DEFAULT_TIME_ZONE ? time = moment.tz(moment(), "Asia/Singapore").format('LTS') : time = moment.tz(moment(), "Asia/Tokyo").format('LTS');
        if (zoneTime.current) {
            zoneTime.current.innerText = time;
        }
    }

    const totalPctUnrealizedPL = (portfolios: IPortfolio[]) => {
        let totalUnrealizedPL = 0;
        let totalInvestedValue = 0;
        if (portfolios) {
            portfolios.forEach(item => {
                if (item) {
                    totalUnrealizedPL += calcUnrealizedPL(item);
                    totalInvestedValue += calcInvestedValue(item);
                }
            });
        }
        if (totalInvestedValue !== 0) {
            return totalUnrealizedPL / totalInvestedValue * 100
        }
        return 0;
    }

    const calcTransactionVolume = (item: IPortfolio) => {
        const buyVolume = item?.totalBuyVolume;
        const sellVolume = item?.totalSellVolume;
        return buyVolume - sellVolume;
    }

    const calcInvestedValue = (item: IPortfolio) => {
        return calcTransactionVolume(item) * convertNumber(item?.avgBuyPrice);
    }

    const calcCurrentValue = (item: IPortfolio) => {
        return calcTransactionVolume(item) * convertNumber(item?.marketPrice);
    }

    const calcUnrealizedPL = (item: IPortfolio) => {
        return calcCurrentValue(item) - calcInvestedValue(item);
    }

    const getNameClass = (item: number) => {
        if (item > 0) {
            return "text-success"
        }
        if (item < 0) {
            return "text-danger"
        } else {
            return ""
        }
    }

    const setGeneralTemplate = () => (
        <div className="mb-3 row">
            <div className="d-flex justify-content-center align-items-center col-md-4">
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Matched Orders</div>
                    <div className="fw-600">{formatNumber(matchedOrder.toString())}</div>
                </div>
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Pending Order</div>
                    <div className="fw-600">{formatNumber(pendingOrder.toString())}</div>
                </div>
                <div className="text-center flex-grow-1 px-3">
                    <div className="small fw-bold">% P/L</div>
                    <div className={`${getNameClass(totalPctUnrealizedPL(portfolio))} fw-600`}>{formatCurrency(totalPctUnrealizedPL(portfolio).toFixed(2))}%</div>
                </div>
            </div>
            <div className="col-md-4"></div>
            <div className="small text-end col-md-4">
                <div>US <span className="ms-2" ref={usTime}></span></div>
                <div className="d-flex align-items-center justify-content-end">
                    <select className="form-select form-select-sm lh-1 me-2 w-4" onChange={(e) => setTimeZone(e.target.value)}>
                        <option value="SG" >SG</option>
                        <option value="JP">JP</option>
                    </select>
                    <span ref={zoneTime}></span>
                </div>
            </div>
        </div>
    )

    const getTickerInfo = (value: ISymbolQuote) => {
        setSymbolCode(value?.symbolCode);
        setSymbolQuote(value);
        // const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        // const ticker = symbols?.find(o => o?.ticker === value.symbolCode)
        // const  element: ITickerInfo = {
        //     ...defaultTickerInfo,
        //     ticker: value.symbolCode,
        //     previousClose: value.close,
        //     open: value.open,
        //     high: value.high,
        //     low: value.low,
        //     lastPrice: value.currentPrice,
        //     volume: value.volumePerDay,
        //     lotSize: ticker.lotSize,
        //     tickSize: ticker.tickSize
        // }
        // handleGetTicker(element);
        // setTicker(element);
    }

    const getPriceOrder = (value: IAskAndBidPrice) => {
        setQuoteInfo(value);
    }

    const getQuoteEventValue = (value: ITickerInfo) => {
        const item: ILastQuote = {
            asksList: value?.asks || [],
            bidsList: value?.bids || [],
            currentPrice: value?.lastPrice,
            pctChange: value?.change,
            quoteTime: 0,
            scale: 0,
            symbolCode: value.symbolId.toString(),
            symbolId: value.symbolId,
            tickPerDay: 0,
            volumePerDay: value.volume,
            volume: value.volume


        }
        setDataSearchTicker(item);
    }

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);

        if (item === MESSAGE_TOAST.SUCCESS_PLACE) {
            sendListOrder();
        }
    }

    const handleGetTicker = (value: ITickerInfo) => {
        if (value.asks) {
            const data: ILastQuote = {
                asksList: value.asks,
                bidsList: value.bids || [],
                close: value.previousClose,
                currentPrice: value.lastPrice,
                high: value.high,
                low: value.low,
                netChange: value.change,
                open: value.open,
                pctChange: value.changePrecent,
                quoteTime: 0,
                scale: 0,
                symbolCode: value.symbolId.toString(),
                symbolId: value.symbolId,
                tickPerDay: 0,
                volumePerDay: value.volume,
                volume: value.volume,
                ticker: value.ticker
            }
            setDataSearchTicker(data)
        } else {
            handleTickerSearch(value.ticker)
        }
    }

    const handleTickerSearch = (value: string) => {
        setSymbolCode(value)
    }

    const getSide = (value: number) => {
        setSide(value);
    }

    return (
        <div className="site-main">
            <div className="container">
                {setGeneralTemplate()}
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-7 mb-3">
                        <TickerDashboard handleTickerInfo={getTickerInfo} symbolCode={symbolCode} />
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-2 mb-3">
                        <div>
                            <OrderBook isDashboard={isDashboard}
                                listDataTicker={handleSymbolList}
                                itemTickerSearch={handleTickerSearch}
                                listTickerSearch={listTickerSearch}
                                tickerDetailLastQuote={getPriceOrder}
                                symbolCode={symbolCode}
                                handleSide={getSide}
                            />
                        </div>
                        <div>
                            <StockInfo listDataTicker={handleSymbolList} symbolCode={symbolCode} />
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-3">
                        <div className="card flex-grow-1">
                            <div className="card-header">
                                <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                            </div>
                            <div className="card-body h-500" >
                                <OrderForm isDashboard={isDashboard}
                                    messageSuccess={messageSuccess}
                                    symbolCode={symbolCode}
                                    symbolQuote={symbolQuote}
                                    quoteInfo={quoteInfo}
                                    side={side} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard