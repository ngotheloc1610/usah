import { useEffect, useRef, useState } from "react";
import OrderBook from "../../components/Order/OrderBook";
import OrderForm from "../../components/Order/OrderForm";
import TickerDashboard from "../../components/TickerDashboard";
import { ACCOUNT_ID, DEFAULT_TIME_ZONE, LIST_TICKER_INFO, SOCKET_CONNECTED } from "../../constants/general.constant";
import { ILastQuote, ITickerInfo } from "../../interfaces/order.interface";
import { ISymbolList } from "../../interfaces/ticker.interface";
import './Dashboard.scss';
import { wsService } from "../../services/websocket-service";
import * as rspb from "../../models/proto/rpc_pb";
import * as pspb from '../../models/proto/pricing_service_pb';
import * as qspb from '../../models/proto/query_service_pb';
import StockInfo from "../../components/Order/StockInfo";
import sendMsgSymbolList from "../../Common/sendMsgSymbolList";
import { DEFAULT_DATA_TICKER } from "../../mocks";
import moment from "moment";
import 'moment-timezone';

const defaultTickerInfo: ITickerInfo = {
    symbolId: 0,
    tickerName: '',
    ticker: '',
    stockPrice: '',
    previousClose: '',
    open: '',
    high: '',
    low: '',
    lastPrice: '',
    volume: '',
    change: '',
    changePrecent: '',
    tickSize: '',
    lotSize: '',
    minLot: ''
}
const Dashboard = () => {
    const isDashboard = true;
    const [ticker, setTicker] = useState(defaultTickerInfo);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    // const [listDataTicker, setListDataTicker] = useState<IListDashboard[]>([]);
    const [handleSymbolList, sethandleSymbolList] = useState<ITickerInfo[]>([]);
    const [dataSearchTicker, setDataSearchTicker] = useState<ILastQuote>();
    const [listTickerSearch, setListTickerSearch] = useState<string[]>([]);
    const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);
    const usTime: any = useRef();
    const zoneTime: any = useRef();

    useEffect(() => mapArrayDashboardList(), [lastQuotes])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                callSymbolListRequest();
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            if (res.symbolList) {
                setSymbolList(res.symbolList);
                if (res.symbolList.length > 0) {
                    const tmp: string[] = [];
                    res.symbolList.forEach((item: ISymbolList) => {
                        tmp.push(item.symbolCode);
                    });
                    setListTickerSearch(tmp);
                }
                subscribeQuoteEvent(res.symbolList);
            }
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    useEffect(() => {
        sendMessageQuotes()
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(res => {
            setLastQuotes(res.quotesList);
        });
        return () => {
            lastQuotesRes.unsubscribe();
        }
    }, [symbolList])

    const subscribeQuoteEvent = (symbols) => {
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

    const sendMessageQuotes = () => {
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

    useEffect(() => {
        const timer = setInterval(() => handleUsTime(), 1000);

        return () => clearTimeout(timer);
    }, [timeZone]);

    useEffect(() => {
        const timer = setInterval(() => handleSetTimeZone(), 1000);

        return () => clearTimeout(timer);
    }, [timeZone]);

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

    const mapArrayDashboardList = () => {

        const getItemSymbolData = (symbolCode: string) => {
            return lastQuotes.find(lastQuotesItem => lastQuotesItem.symbolCode === symbolCode);
        }

        let listData: ITickerInfo[] = [];

        let itemData: ITickerInfo = {
            symbolId: 0,
            tickerName: '',
            ticker: '',
            stockPrice: '',
            previousClose: '',
            open: '',
            high: '',
            low: '',
            lastPrice: '',
            volume: '',
            change: '',
            changePrecent: '',
            side: '',
            lotSize: '',
            minLot: '',
            tickSize: '',
        };

        symbolList.forEach(item => {
            const itemSymbolData = getItemSymbolData(item.symbolId.toString());
            itemData = {
                tickerName: item.symbolName,
                symbolId: item.symbolId,
                ticker: item.symbolCode,
                previousClose: itemSymbolData?.close,
                open: itemSymbolData?.open,
                high: itemSymbolData?.high,
                low: itemSymbolData?.low,
                lastPrice: (itemSymbolData && itemSymbolData.currentPrice) ? itemSymbolData?.currentPrice : '',
                volume: (itemSymbolData && itemSymbolData.volumePerDay) ? itemSymbolData?.volumePerDay : '',
                change: calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open).toString(),
                changePrecent: ((calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open) / Number(getItemSymbolData(item.symbolId.toString())?.open)) * 100).toString(),
                tickSize: item.tickSize,
                lotSize: item.lotSize,
                minLot: item.minLot,
            }
            listData.push(itemData);
        })

        sethandleSymbolList(listData)
        localStorage.setItem(LIST_TICKER_INFO, JSON.stringify(listData).toString())
    }

    const calculateChange = (lastPrice?: string, open?: string) => {
        return Number(lastPrice) - Number(open)
    }

    const setGeneralTemplate = () => (
        <div className="mb-3 row">
            <div className="d-flex justify-content-center align-items-center col-md-4">
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Matched Orders</div>
                    <div className="fw-600">36</div>
                </div>
                <div className="text-center flex-grow-1 px-3 border-end">
                    <div className="small fw-bold">Pending Order</div>
                    <div className="fw-600">36</div>
                </div>
                <div className="text-center flex-grow-1 px-3">
                    <div className="small fw-bold">% P/L</div>
                    <div className="text-success fw-600">4.56%</div>
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

    const getTickerInfo = (value: ILastQuote) => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const ticker = symbols?.find(o => o?.ticker === value.symbolCode)
        const  element: ITickerInfo = {
            ...defaultTickerInfo,
            ticker: value.symbolCode,
            previousClose: value.close,
            open: value.open,
            high: value.high,
            low: value.low,
            lastPrice: value.currentPrice,
            volume: value.volumePerDay,
            lotSize: ticker.lotSize,
            tickSize: ticker.tickSize
        }
        handleGetTicker(element);
        setTicker(element);
    }

    const getPriceOrder = (value: ITickerInfo) => {
        setTicker(value);
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
        const itemTicker = handleSymbolList.find(item => item.ticker === value.toLocaleUpperCase());
        let symbolId = {};
        if (itemTicker) {
            setTicker(itemTicker);
            symbolId = itemTicker.symbolId;
            if (symbolId && lastQuotes) {
                const dataSearch = lastQuotes.find(item => Number(item.symbolCode) === symbolId);
                return setDataSearchTicker(dataSearch ? { ...dataSearch, ticker: itemTicker.ticker } : DEFAULT_DATA_TICKER);
            }
            setTicker(defaultTickerInfo);
            return setDataSearchTicker(DEFAULT_DATA_TICKER);
        }
        setTicker(defaultTickerInfo);
        return setDataSearchTicker(DEFAULT_DATA_TICKER);
    }

    return (
        <div className="site-main">
            <div className="container">
                {setGeneralTemplate()}
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-7 mb-3">
                        <TickerDashboard handleTickerInfo={getTickerInfo} listDataTicker={handleSymbolList} handleQuoteEvent={getQuoteEventValue} />
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-2 mb-3">
                        <div>
                            <OrderBook isDashboard={isDashboard}
                                listDataTicker={handleSymbolList}
                                itemTickerSearch={handleTickerSearch}
                                listTickerSearch={listTickerSearch}
                                tickerDetailLastQuote={getPriceOrder}
                                currentTicker={ticker} />
                        </div>
                        <div>
                            <StockInfo listDataTicker={handleSymbolList} detailTicker={ticker} />
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-3">
                        <div className="card flex-grow-1">
                            <div className="card-header">
                                <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                            </div>
                            <div className="card-body h-500" >
                                <OrderForm isDashboard={isDashboard} currentTicker={ticker} messageSuccess={messageSuccess} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard