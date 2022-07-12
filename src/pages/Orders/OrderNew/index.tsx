import { useEffect, useState } from 'react'
import OrderBook from '../../../components/Order/OrderBook'
import OrderForm from '../../../components/Order/OrderForm'
import TickerDetail from '../../../components/Order/TickerDetail'
import TickerSearch from '../../../components/Order/TickerSearch'
import { LIST_PRICE_TYPE, LIST_TICKER_INFO, SOCKET_CONNECTED } from '../../../constants/general.constant'
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from '../../../interfaces/order.interface'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service"
import * as pspb from '../../../models/proto/pricing_service_pb'
import * as rpcpb from "../../../models/proto/rpc_pb";
import './OrderNew.scss'
import { DEFAULT_CURRENT_TICKER, DEFAULT_DATA_TICKER } from '../../../mocks'
import { assignListPrice, calcChange, calcPctChange, checkValue } from '../../../helper/utils'
import { IQuoteEvent } from '../../../interfaces/quotes.interface'

const OrderNew = () => {
    const defaultItemSymbol: ISymbolList = {
        calculationMode: 0,
        contractSize: 0,
        currencyCode: '',
        description: '',
        digits: 0,
        exchange: '',
        lotSize: '',
        minLot: '',
        symbolCode: '',
        symbolId: 0,
        symbolName: '',
        tickSize: '',
    }

    const defaultLastQuotesData: ILastQuote[] = []

    const [lastQuotes, setLastQuotes] = useState(defaultLastQuotesData)
    const [currentTicker, setCurrentTicker] = useState(DEFAULT_CURRENT_TICKER);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolList, setSymbolList] = useState<ISymbolList[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]'));
    const [dataSearchTicker, setDataSearchTicker] = useState<ILastQuote>();
    const [currentTickerSearch, setCurrentTickerSearch] = useState<string>('');
    const [quoteEvent, setQuoteEvent] = useState([]);
    const [symbolCode, setSymbolCode] = useState('');
    const [side, setSide] = useState(0);
    const [quoteInfo, setQuoteInfo] = useState<IAskAndBidPrice>();
    
    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessageQuotes();
            }
        });

        return () => {
            ws.unsubscribe();
        }
    }, [])

    useEffect(() => {
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(res => {
            if (res.quotesList) {
                const item = res.quotesList.find(o => o?.symbolCode?.toString() === currentTickerSearch)
                if (item) {
                    setDataSearchTicker(item);
                }
                setLastQuotes(res.quotesList);
            }
        });

        return () => lastQuotesRes.unsubscribe();

    }, [currentTickerSearch])

    const sendMessageQuotes = () => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();

            const symbolCodes: string[] = symbolList.map(item => item.symbolCode);
            lastQuotesRequest.setSymbolCodeList(symbolCodes);

            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getItemSymbolData = (symbolCode: string) => {
        return lastQuotes.find(lastQuotesItem => lastQuotesItem.symbolCode === symbolCode);
    }

    const calculateChange = (lastPrice?: string, open?: string) => {
        return Number(lastPrice) - Number(open)
    }

    const assignDataGetLastQuote = (symbolCode: number) => {
        const dataSearch = lastQuotes.find(item => Number(item.symbolCode) === symbolCode);
        return setDataSearchTicker(dataSearch ? { ...dataSearch } : DEFAULT_DATA_TICKER);

    }

    const getTicker = (value: string) => {
        setSymbolCode(value);
        const symbolLocalList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]')
        const itemTickerInfor = symbolLocalList.find(item => item.ticker === value.toUpperCase());
        subscribeQuoteEvent(value)
        if (currentTickerSearch) {
            unSubscribeQuoteEvent(itemTickerInfor?.symbolCode || '');
        }
        setCurrentTickerSearch(value);
        assignDataGetLastQuote(Number(value));
        const itemSymbol = symbolList.find((o: ISymbolList) => o.symbolCode === value)
        let item: ISymbolList = itemSymbol ? itemSymbol : defaultItemSymbol;
        const itemSymbolData = getItemSymbolData(item.symbolCode);
        const currentPrice = itemSymbolData?.currentPrice.toString();
        const currentVolume = itemSymbolData?.volumePerDay;
        const currentChange = calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open);
        const changePercent = (itemSymbolData && itemSymbolData.open) && calcPctChange(itemSymbolData.currentPrice, itemSymbolData.open);
        const itemLocal = symbolLocalList.find(o => o.symbolCode === item.symbolCode);
        const assignTickerInfo: ITickerInfo = {
            symbolId: Number(item.symbolId),
            tickerName: item.symbolName,
            ticker: item.symbolCode,
            lastPrice: currentPrice ? currentPrice : '',
            volume: currentVolume ? currentVolume : '',
            change: currentChange ? currentChange.toString() : '',
            changePrecent: changePercent ? changePercent.toString() : '',
            open: itemLocal ? itemLocal.open : '0',
            high: itemLocal ? itemLocal.high : '0',
            low: itemLocal ? itemLocal.low : '0',
            tickSize: item.tickSize,
            minLot: item.minLot,
            lotSize: item.lotSize
        }
        setCurrentTicker(assignTickerInfo);
    }

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
        sendMessageQuotes();
        assignDataGetLastQuote(Number(currentTickerSearch));
    }

    useEffect(() => {
        const subscribeQuote = wsService.getSubscribeQuoteSubject().subscribe(resp => {
        });

        const quotes = wsService.getQuoteSubject().subscribe(resp => {
            if (resp && resp.quoteList) {
                setQuoteEvent(resp.quoteList);
            }
        });

        const unsubscribeQuote = wsService.getUnsubscribeQuoteSubject().subscribe(resp => {
            if (resp.msgText === "SUCCESS") {
                if (currentTickerSearch !== '') {
                    subscribeQuoteEvent(currentTickerSearch);
                }
            }
        });

        return () => {
            quotes.unsubscribe();
            unSubscribeQuoteEvent(currentTickerSearch);
            unsubscribeQuote.unsubscribe();
            subscribeQuote.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processQuotes(quoteEvent);
    }, [quoteEvent])

    const processQuotes = (quotes: IQuoteEvent[]) => {        
        const quote = quotes.find(o => o?.symbolCode === dataSearchTicker?.symbolCode);
        const itemSymbol = symbolList.find((o: ISymbolList) => o.symbolCode.toString() === currentTickerSearch)
        let item: ISymbolList = itemSymbol ? itemSymbol : defaultItemSymbol;
        if (quote && dataSearchTicker) {
            const tmpItem = {
                asksList: assignListPrice(dataSearchTicker.asksList, quote.asksList, LIST_PRICE_TYPE.askList),
                bidsList: assignListPrice(dataSearchTicker.bidsList, quote.bidsList, LIST_PRICE_TYPE.bidList),
                high: checkValue(dataSearchTicker.high, quote.high),
                low: checkValue(dataSearchTicker.low, quote.low),
                open: checkValue(dataSearchTicker.open, quote.open),
                lastPrice: checkValue(dataSearchTicker.currentPrice, quote.currentPrice),
                volume: checkValue(dataSearchTicker.volumePerDay, quote.volumePerDay),
                symbolId: Number(item.symbolId),
                tickerName: item.symbolName,
                ticker: item.symbolCode,
                tickSize: item.tickSize,
                minLot: item.minLot,
                lotSize: item.lotSize
            }
            setCurrentTicker(tmpItem);
        }
    }

    const subscribeQuoteEvent = (symbolId: string) => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            subscribeQuoteEventReq.addSymbolCode(symbolId);
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

    // wait handle ticker detail last quote in screen order book
    const handleItemSearch = (value: string) => {

    }
    // wait handle ticker detail last quote in screen order book
    const handleTickerDetailLastQuote = (value: IAskAndBidPrice) => {
        setQuoteInfo(value);
    }

    const getSide = (value: number) => {
        setSide(value);
    }
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">New Order</h6>
                </div>
                <TickerSearch handleTicker={getTicker} listTicker={symbolList} />
                <div className="card-body">
                    <div className="row align-items-stretch">
                        <div className="col-lg-9 col-md-8 border-end">
                            <TickerDetail currentTicker={currentTicker} symbolCode={currentTicker.ticker} />
                            <div className="row justify-content-center">
                                <div className="col-xl-5 col-lg-6">
                                    <OrderForm isDashboard={false}
                                               messageSuccess={messageSuccess}
                                               symbolCode={symbolCode}
                                               quoteInfo={quoteInfo}
                                               side={side} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4">
                            <OrderBook currentTicker={currentTicker}
                                    symbolCode={symbolCode}
                                    itemTickerSearch={handleItemSearch} 
                                    tickerDetailLastQuote={handleTickerDetailLastQuote}
                                    handleSide={getSide} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default OrderNew