import { useEffect, useState } from 'react'
import sendMsgSymbolList from '../../../Common/sendMsgSymbolList'
import OrderBook from '../../../components/Order/OrderBook'
import OrderForm from '../../../components/Order/OrderForm'
import TickerDetail from '../../../components/Order/TickerDetail'
import TickerSearch from '../../../components/Order/TickerSearch'
import { SOCKET_CONNECTED } from '../../../constants/general.constant'
import { ILastQuote, ITickerInfo } from '../../../interfaces/order.interface'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service"
import * as pspb from '../../../models/proto/pricing_service_pb'
import * as rspb from "../../../models/proto/rpc_pb";
import './OrderNew.scss'

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
    const defaultTickerSearch: ILastQuote = {
        asksList: [],
        bidsList: [],
        close: '',
        currentPrice: '',
        high: '',
        low: '',
        netChange: '',
        open: '',
        pctChange: '',
        quoteTime: 0,
        scale: 0,
        symbolCode: '',
        symbolId: 0,
        tickPerDay: 0,
        volumePerDay: '',
        volume: ''
    }
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [dataSearchTicker, setDataSearchTicker] = useState<ILastQuote>();

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
        sendMessageQuotes()
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(res => {
            setLastQuotes(res.quotesList);
        });
        return () => {
            lastQuotesRes.unsubscribe();
        }
    }, [symbolList])

    const sendMessageQuotes = () => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();
            
            const symbolCodes: string[] = symbolList.map(item => item.symbolId.toString());
            lastQuotesRequest.setSymbolCodeList(symbolCodes);

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }
    
    const defaultLastQuotesData: ILastQuote[] = []

    const [lastQuotes, setLastQuotes] = useState(defaultLastQuotesData)
    const [currentTicker, setCurrentTicker] = useState(defaultTickerData);
    const [msgSuccess, setMsgSuccess] = useState<string>('');

    const getItemSymbolData = (symbolCode: string) => {
        return lastQuotes.find(lastQuotesItem => lastQuotesItem.symbolCode === symbolCode);
    }

    const calculateChange = (lastPrice?: string, open?: string) => {
        return Number(lastPrice) - Number(open)
    }

    const assignDataGetLastQuote = (symbolCode: number) => {
        const dataSearch = lastQuotes.find(item => Number(item.symbolCode) === symbolCode);
        return setDataSearchTicker(dataSearch ? {...dataSearch} : defaultTickerSearch);
            
    }
    const getTicker = (value: string) => {
        assignDataGetLastQuote(Number(value));
        const itemSymbol = symbolList.find((o: ISymbolList) => o.symbolId.toString() === value)
        let item: ISymbolList = itemSymbol ? itemSymbol : defaultItemSymbol;
        const itemSymbolData = getItemSymbolData(item.symbolId.toString());
        const currentPrice = itemSymbolData?.currentPrice.toString();
        const currentVolume = itemSymbolData?.volumePerDay;
        const currentChange = calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open);
        const changePercent = (calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open)/Number(itemSymbolData?.open))*100;
        const assignTickerInfo: ITickerInfo = {
            symbolId: Number(item.symbolCode),
            tickerName: item.symbolName,
            ticker: item.symbolCode,
            lastPrice: currentPrice ? currentPrice : '',
            volume: currentVolume ? currentVolume : '' ,
            change: currentChange ? currentChange.toString() : '',
            changePrecent: changePercent ? changePercent.toString() : '',
        }
        setCurrentTicker(assignTickerInfo);
    }

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
    }
    const handleItemSearch = (value: string) => {

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
                                    <OrderForm currentTicker={currentTicker} messageSuccess={messageSuccess}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4">
                            <OrderBook itemTickerSearch={handleItemSearch} dataSearchTicker={dataSearchTicker} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default OrderNew