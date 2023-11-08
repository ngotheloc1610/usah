import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { wsService } from "../../services/websocket-service";
import * as rspb from "../../models/proto/rpc_pb";
import * as pspb from '../../models/proto/pricing_service_pb';
import * as qspb from '../../models/proto/query_service_pb';
import * as qmpb from "../../models/proto/query_model_pb";

import { ACCOUNT_ID, LIST_TICKER_ALL, LIST_TICKER_INFO, LIST_WATCHING_TICKERS, LIST_WATCHING_TICKERS_BIG, SOCKET_CONNECTED, SOCKET_RECONNECTED } from "../../constants/general.constant";
import { IAskAndBidPrice, ILastQuote, IPortfolio, ISymbolQuote, ITickerInfo, ISummaryOrder } from "../../interfaces/order.interface";
import { checkValue, convertNumber, defindConfigPost, filterActiveListWatching, formatCurrency, getClassName } from "../../helper/utils";
import { IQuoteEvent } from "../../interfaces/quotes.interface";
import { API_GET_SUMMARY_ORDERS, API_POST_ACCOUNT_PORTFOLIO } from "../../constants/api.constant";
import { success } from "../../constants";
import { setWarningMessage } from "../../redux/actions/App";

import OrderBook from "../../components/Order/OrderBook";
import OrderForm from "../../components/Order/OrderForm";
import TickerDashboard from "../../components/TickerDashboard";
import './Dashboard.scss';

const Dashboard = () => {
    const isDashboard = true;
    const queryModelPb: any = qmpb;
    const api_url = window.globalThis.apiUrl;

    const dispatch = useDispatch();
    const [symbolCode, setSymbolCode] = useState('');
    const [msgSuccess, setMsgSuccess] = useState<string>('');

    const [handleSymbolList, sethandleSymbolList] = useState<ITickerInfo[]>([]);
    const [listTickerSearch, setListTickerSearch] = useState<string[]>([]);

    const [side, setSide] = useState(0);
    const [symbolQuote, setSymbolQuote] = useState<ISymbolQuote>();
    const [quoteInfo, setQuoteInfo] = useState<IAskAndBidPrice>()
    const [portfolio, setPortfolio] = useState<IPortfolio[]>([]);
    const [accountDetail, setAccountDetail] = useState<ISummaryOrder>();
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [volumeTrade, setVolumeTrade] = useState('0');
    
    const { warningMessage, enableFlag } = useSelector((state: any) => state.app);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                callSymbolListRequest();
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
                 //TODO: check if have many OrderEvent in 1 time -> lattency 
                getSummaryOrders();
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
                    filterActiveListWatching(LIST_WATCHING_TICKERS, symbolListActive);
                    filterActiveListWatching(LIST_WATCHING_TICKERS_BIG, symbolListActive)
                    symbolListActive.forEach(item => {
                        if (item) {
                            temps.push(item?.symbolCode);
                        }
                    });
                    setListTickerSearch(temps);
                } else {
                    localStorage.removeItem(LIST_WATCHING_TICKERS);
                    localStorage.removeItem(LIST_WATCHING_TICKERS_BIG);
                }
                if (symbolListActive[0] && isFirstTime) {
                    setSymbolCode(symbolListActive[0]?.symbolCode || '');
                    setIsFirstTime(false);
                }
                subscribeQuoteEvent(symbolListActive);
                callLastQuoteRequest(symbolListActive)
            }
        });

        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setLastQuotes(quote.quotesList);
            }
        })

        const warningMessage = wsService.getWarningMessage().subscribe(res => {
            if (res) {
                dispatch(setWarningMessage({
                    warningMessage: res.content,
                    enableFlag: res.enableFlg
                }));
            }
        })

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
            lastQuote.unsubscribe();
            orderEvent.unsubscribe();
            unSubscribeQuoteEvent();
            warningMessage.unsubscribe();
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

    useEffect(() => {
        getSummaryOrders();
        getAccountPortfolio();
    }, [])
    
    const getSummaryOrders = () => {
        const url = `${api_url}${API_GET_SUMMARY_ORDERS}`;
        
        axios.get(url, defindConfigPost()).then((resp) => {
            if(resp.data.meta.code === success){
                setAccountDetail(resp.data.data);
            }
        }).catch((error: any) => {
            console.log("error", error);
        });
    }

    const getAccountPortfolio = () => {
        const url = `${api_url}${API_POST_ACCOUNT_PORTFOLIO}`;
        const listAccountId: String[] = [];
        if (sessionStorage.getItem(ACCOUNT_ID)) {
            listAccountId.push(sessionStorage.getItem(ACCOUNT_ID) || "");
        }
        const payload = {
            "account_ids": listAccountId
        }
        axios.post(url, payload, defindConfigPost()).then((resp) => {
            if (resp.data.meta.code === success) {
                setPortfolio(resp.data.data.portfolios);
            }
        }).catch((error: any) => {
            console.log("Failed to get account portfolio", error);
        });
    }
    
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
        const accountId = sessionStorage.getItem(ACCOUNT_ID);
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
        <div className="mb-2 row">
            <div className="col-md-4">
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="text-center px-3 border-end col-md-4">
                        <div className="small fw-bold">Matched Orders</div>
                        <div className="fw-600">{accountDetail ? accountDetail.num_trades : "-"}</div>
                    </div>
                    <div className="text-center px-3 border-end col-md-4">
                        <div className="small fw-bold">Pending Orders</div>
                        <div className="fw-600">{accountDetail ? accountDetail.num_pending_orders : "-"}</div>
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
                {enableFlag && <p className="text-danger fz-14">{warningMessage}</p>}
                <div className="row mt-2">
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-7 mb-3">
                        <TickerDashboard handleTickerInfo={getTickerInfo} symbolCode={symbolCode} />
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-2 mb-3">
                        <OrderBook isDashboard={isDashboard}
                            listDataTicker={handleSymbolList}
                            itemTickerSearch={handleTickerSearch}
                            listTickerSearch={listTickerSearch}
                            tickerDetailLastQuote={getPriceOrder}
                            symbolCode={symbolCode}
                            handleSide={getSide}
                        />
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-3 mb-3">
                        <div className="card flex-grow-1">
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