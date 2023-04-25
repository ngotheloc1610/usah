import { useCallback, useEffect, useState } from "react";
import OrderBook from "../../components/Order/OrderBook";
import OrderForm from "../../components/Order/OrderForm";
import TickerDashboard from "../../components/TickerDashboard";
import { ACCOUNT_ID, LIST_TICKER_ALL, LIST_TICKER_INFO, LIST_WATCHING_TICKERS, SOCKET_CONNECTED, SOCKET_RECONNECTED } from "../../constants/general.constant";
import { IAskAndBidPrice, ILastQuote, IPortfolio, ISymbolInfo, ISymbolQuote, ITickerInfo, IAccountDetail } from "../../interfaces/order.interface";
import './Dashboard.scss';
import { wsService } from "../../services/websocket-service";
import * as rspb from "../../models/proto/rpc_pb";
import * as pspb from '../../models/proto/pricing_service_pb';
import * as qspb from '../../models/proto/query_service_pb';
import * as sspb from "../../models/proto/system_service_pb";
import * as qmpb from "../../models/proto/query_model_pb";
import { checkValue, convertNumber, formatCurrency, getClassName } from "../../helper/utils";
import { IQuoteEvent } from "../../interfaces/quotes.interface";

const Dashboard = () => {
    const isDashboard = true;
    const queryModelPb: any = qmpb;
    const [symbolCode, setSymbolCode] = useState('');
    const [msgSuccess, setMsgSuccess] = useState<string>('');

    const [handleSymbolList, sethandleSymbolList] = useState<ITickerInfo[]>([]);
    const [listTickerSearch, setListTickerSearch] = useState<string[]>([]);

    const [side, setSide] = useState(0);
    const [symbolQuote, setSymbolQuote] = useState<ISymbolQuote>();
    const [quoteInfo, setQuoteInfo] = useState<IAskAndBidPrice>()
    const [portfolio, setPortfolio] = useState<IPortfolio[]>([]);
    const [accountDetail, setAccountDetail] = useState<IAccountDetail>();
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [volumeTrade, setVolumeTrade] = useState('0');

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                callSymbolListRequest();
            }

            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                sendAccountPortfolio();
                sendAccountDetail();
            }

            if (resp === SOCKET_RECONNECTED) {
                const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
                const symbolListActive = symbols.filter(item => item.symbolStatus !== queryModelPb.SymbolStatus.SYMBOL_DEACTIVE);
                subscribeQuoteEvent(symbolListActive);
                callLastQuoteRequest(symbolListActive)
            }
        });

        const orderEvent = wsService.getOrderEvent().subscribe(resp => {
            if (resp && resp.orderList) {
                sendAccountDetail();
            }
        })

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            if (res.symbolList && res.symbolList.length > 0) {
                let symbolListActive = res.symbolList.filter(item => item.symbolStatus !== queryModelPb.SymbolStatus.SYMBOL_DEACTIVE);
                symbolListActive = symbolListActive.sort((a, b) => a?.symbolCode?.localeCompare(b?.symbolCode));
                localStorage.setItem(LIST_TICKER_INFO, JSON.stringify(symbolListActive));
                localStorage.setItem(LIST_TICKER_ALL, JSON.stringify(res.symbolList));
                if (symbolListActive.length > 0) {
                    const temps: string[] = [];
                    const newWatchList: any[] = [];
                    const watchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
                    watchList.forEach(item => {
                        const idx = symbolListActive.findIndex(o => o?.symbolCode === item?.symbolCode);
                        if (idx >= 0) {
                            newWatchList.push(item);
                        }
                    });
                    localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(newWatchList));
                    symbolListActive.forEach(item => {
                        if (item) {
                            temps.push(item?.symbolCode);
                        }
                    });
                    setListTickerSearch(temps);
                } else {
                    localStorage.removeItem(LIST_WATCHING_TICKERS);
                }
                if (symbolListActive[0] && isFirstTime) {
                    setSymbolCode(symbolListActive[0]?.symbolCode || '');
                    setIsFirstTime(false);
                }
                subscribeQuoteEvent(symbolListActive);
                callLastQuoteRequest(symbolListActive)
            }
        });

        const portfolioRes = wsService.getAccountPortfolio().subscribe(res => {
            if (res && res.accountPortfolioList) {
                setPortfolio(res.accountPortfolioList);
            }
        });

        const customerInfoDetailRes = wsService.getCustomerInfoDetail().subscribe(res => {   
            if (res && res.account) {
                setAccountDetail(res.account);
            }
        });

        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setLastQuotes(quote.quotesList);
            }
        })

        // const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
        //     if (quote && quote.quoteList) {
        //         setQuoteEvent(quote.quoteList);
        //     }
        // });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
            portfolioRes.unsubscribe();
            // quoteEvent.unsubscribe();
            lastQuote.unsubscribe();
            customerInfoDetailRes.unsubscribe();
            orderEvent.unsubscribe();
            unSubscribeQuoteEvent();
        }
    }, [])
    
    useEffect(() => {
        processLastQuote(lastQuotes, portfolio);
    }, [lastQuotes, symbolCode]);
    
    useEffect(() => {
        processQuoteEvent(quoteEvent, portfolio);
    }, [quoteEvent]);
    
    useEffect(() => {
        setQuoteInfo(undefined)
    },[symbolCode]);
    
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
                setIsLoading(false);
            });
            setPortfolio(temp);
        }

        const symbolQuote = lastQuotes.find(o => o?.symbolCode === symbolCode);
        if (symbolQuote) {
            setVolumeTrade(symbolQuote?.volumePerDay)
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

    const sendAccountDetail = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        const SystemServicePb: any = sspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let infoDetailRequest = new SystemServicePb.AccountDetailRequest();
            infoDetailRequest.setAccountId(Number(accountId));

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ACCOUNT_DETAIL_REQ);
            rpcMsg.setPayloadData(infoDetailRequest.serializeBinary());
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

    const unSubscribeQuoteEvent = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rspb;
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
        const symbolListActive = symbols.filter(item => item.symbolStatus !== queryModelPb.SymbolStatus.SYMBOL_DEACTIVE);
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            symbolListActive.forEach(item => {
                unsubscribeQuoteReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
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

    const calcAvgPrice = (item: IPortfolio) => {
        return convertNumber(item.totalBuyVolume) !== 0 && convertNumber(item.ownedVolume) > 0 ? convertNumber(item.totalBuyAmount) / convertNumber(item.totalBuyVolume) : 0;
    }

    const calcInvestedValue = (item: IPortfolio) => {
        return convertNumber(item.ownedVolume) * calcAvgPrice(item);
    }

    const calcCurrentValue = (item: IPortfolio) => {
        return convertNumber(item.ownedVolume.toString()) * convertNumber(item.marketPrice);
    }

    const calcUnrealizedPL = (item: IPortfolio) => {
        return calcCurrentValue(item) - calcInvestedValue(item);
    }

    const setGeneralTemplate = () => (
        <div className="mb-3 row">
            <div className="col-md-4">
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="text-center px-3 border-end col-md-4">
                        <div className="small fw-bold">Matched Orders</div>
                        <div className="fw-600">{isLoading ? '-' : accountDetail?.numTrades}</div>
                    </div>
                    <div className="text-center px-3 border-end col-md-4">
                        <div className="small fw-bold">Pending Orders</div>
                        <div className="fw-600">{isLoading ? '-' : accountDetail?.numPendingOrders}</div>
                    </div>
                    <div className="text-center px-3 col-md-4">
                        <div className="small fw-bold">% P/L</div>
                        <div className={`${getClassName(totalPctUnrealizedPL(portfolio))} fx-600`}>{isLoading ? '-' : formatCurrency(totalPctUnrealizedPL(portfolio).toFixed(2)) + '%'}</div>
                    </div>
                </div>
            </div>
            <div className="col-md-4"></div>
        </div>
    )

    const getTickerInfo = useCallback((value: ISymbolQuote) => {
        setVolumeTrade(value?.volume);
        setSymbolCode(value?.symbolCode);
        setSymbolQuote(value);
    }, []);

    const getPriceOrder = useCallback((value: IAskAndBidPrice) => {
        setQuoteInfo(value);
    }, [])

    const messageSuccess = useCallback((item: string) => {
        setMsgSuccess(item);
    }, [])

    const handleTickerSearch = useCallback((value: string) => {
        setSymbolCode(value);
    }, [])

    const getSide = useCallback((value: number) => {
        setSide(value);
    }, [])

    return (
        <div className="site-main">
            <div className="container">
                {setGeneralTemplate()}
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-7 ">
                        <TickerDashboard handleTickerInfo={getTickerInfo} symbolCode={symbolCode} />
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-2 mb-3">
                        <div className="max-height-72">
                            <OrderBook isDashboard={isDashboard}
                                listDataTicker={handleSymbolList}
                                itemTickerSearch={handleTickerSearch}
                                listTickerSearch={listTickerSearch}
                                tickerDetailLastQuote={getPriceOrder}
                                symbolCode={symbolCode}
                                handleSide={getSide}
                            />
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-3">
                        <div className="card flex-grow-1 h-94">
                            <div className="card-header">
                                <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                            </div>
                            <div className="card-body border border-2" >
                                <OrderForm isDashboard={isDashboard}
                                    isMonitoring={false}
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