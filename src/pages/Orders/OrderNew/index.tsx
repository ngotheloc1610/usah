import { useEffect, useState } from 'react'
import sendMsgSymbolList from '../../../Common/sendMsgSymbolList'
import OrderBook from '../../../components/Order/OrderBook'
import OrderForm from '../../../components/Order/OrderForm'
import TickerDetail from '../../../components/Order/TickerDetail'
import TickerSearch from '../../../components/Order/TickerSearch'
import { LIST_PRICE_TYPE, LIST_TICKER_INFO, SOCKET_CONNECTED } from '../../../constants/general.constant'
import { ILastQuote, ITickerInfo } from '../../../interfaces/order.interface'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service"
import * as pspb from '../../../models/proto/pricing_service_pb'
import * as rpcpb from "../../../models/proto/rpc_pb";
import './OrderNew.scss'
import { DEFAULT_DATA_TICKER } from '../../../mocks'
import { assignListPrice, calcChange, calcPctChange, checkValue } from '../../../helper/utils'
import { IQuoteEvent } from '../../../interfaces/quotes.interface'

const OrderNew = () => {

    const defaultTickerData: ITickerInfo | any = {
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
    }

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
    const [currentTicker, setCurrentTicker] = useState(defaultTickerData);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [dataSearchTicker, setDataSearchTicker] = useState<ILastQuote>();
    const [currentTickerSearch, setCurrentTickerSearch] = useState<string>('');
    const [quoteEvent, setQuoteEvent] = useState([]);
    const [itemTickerDetail, setItemTickerDetail] = useState<ILastQuote>(DEFAULT_DATA_TICKER);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList);
        });
        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
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

    useEffect(() => {
        sendMessageQuotes()
    }, [symbolList])

    const sendMessageQuotes = () => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();

            const symbolCodes: string[] = symbolList.map(item => item.symbolId.toString());
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
        wsService.getDataLastQuotes().subscribe(response => {
            const tickerDetail = response.quotesList.find((item: ILastQuote) => Number(item.symbolCode) === Number(value));
            setItemTickerDetail(tickerDetail);
        });

        setCurrentTickerSearch(value);
        assignDataGetLastQuote(Number(value));
        const itemSymbol = symbolList.find((o: ISymbolList) => o.symbolId.toString() === value)
        let item: ISymbolList = itemSymbol ? itemSymbol : defaultItemSymbol;
        const itemSymbolData = getItemSymbolData(item.symbolId.toString());
        const currentPrice = itemSymbolData?.currentPrice.toString();
        const currentVolume = itemSymbolData?.volumePerDay;
        const currentChange = calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open);
        const changePercent = (calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open) / Number(itemSymbolData?.open)) * 100;
        const symbolLocalList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]')
        const itemLocal = symbolLocalList.find(o => o.symbolId === item.symbolId);
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
        getTicker(currentTickerSearch);
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
    })

    useEffect(() => {
        processQuotes(quoteEvent);
    }, [quoteEvent])

    const processQuotes = (quotes: IQuoteEvent[]) => {
        const quote = quotes.find(o => o?.symbolCode === dataSearchTicker?.symbolCode);
        const itemSymbol = symbolList.find((o: ISymbolList) => o.symbolId.toString() === currentTickerSearch)
        let item: ISymbolList = itemSymbol ? itemSymbol : defaultItemSymbol;

        if (quote && dataSearchTicker) {
            const tmpItem = {
                asksList: assignListPrice(dataSearchTicker.asksList, quote.asksList, LIST_PRICE_TYPE.askList),
                bidsList: assignListPrice(dataSearchTicker.bidsList, quote.bidsList, LIST_PRICE_TYPE.bidList),
                high: checkValue(dataSearchTicker.high, quote.high),
                low: checkValue(dataSearchTicker.low, quote.low),
                change: assignChangeValue(dataSearchTicker, quote).toFixed(2),
                open: checkValue(dataSearchTicker.open, quote.open),
                lastPrice: checkValue(dataSearchTicker.currentPrice, quote.currentPrice),
                volume: checkValue(dataSearchTicker.volumePerDay, quote.volumePerDay),
                changePrecent: assignPctChangeValue(dataSearchTicker, quote).toFixed(2),
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

    const assignChangeValue = (tickerInfo: ILastQuote, quote: IQuoteEvent) => {
        const lastPrice = checkValue(tickerInfo.netChange, quote.netChange);
        const open = checkValue(tickerInfo.open, quote.open);
        return calcChange(lastPrice, open);
    }

    const assignPctChangeValue = (tickerInfo: ILastQuote, quote: IQuoteEvent) => {
        const lastPrice = checkValue(tickerInfo.pctChange, quote.pctChange);
        const open = checkValue(tickerInfo.open, quote.open);
        return calcPctChange(lastPrice, open);
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
    const handleTickerDetailLastQuote = (value: ITickerInfo) => {
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
                            <TickerDetail currentTicker={currentTicker} />
                            <div className="row justify-content-center">
                                <div className="col-xl-5 col-lg-6">
                                    <OrderForm currentTicker={currentTicker} messageSuccess={messageSuccess} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4">
                            <OrderBook itemTickerSearch={handleItemSearch} dataSearchTicker={dataSearchTicker} tickerDetailLastQuote={handleTickerDetailLastQuote} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default OrderNew