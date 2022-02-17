import { useEffect, useState } from "react";
import OrderBook from "../../components/Order/OrderBook";
import OrderForm from "../../components/Order/OrderForm";
import TickerDashboard from "../../components/TickerDashboard";
import { LIST_TICKER_INFO, SOCKET_CONNECTED } from "../../constants/general.constant";
import { ILastQuote, ITickerInfo } from "../../interfaces/order.interface";
import { ISymbolList } from "../../interfaces/ticker.interface";
import './Dashboard.css';
import { wsService } from "../../services/websocket-service";
import * as rspb from "../../models/proto/rpc_pb";
import * as pspb from '../../models/proto/pricing_service_pb';
import StockInfo from "../../components/Order/StockInfo";
import sendMsgSymbolList from "../../Common/sendMsgSymbolList";
import { defaultTickerSearch } from "../../mocks";

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
    const [isDashboard, setIsDashboard] = useState(true);
    const [ticker, setTicker] = useState(defaultTickerInfo);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    // const [listDataTicker, setListDataTicker] = useState<IListDashboard[]>([]);
    const [handleSymbolList, sethandleSymbolList] = useState<ITickerInfo[]>([]);
    const [dataSearchTicker, setDataSearchTicker] = useState<ILastQuote>();
    const [listTickerSearch, setListTickerSearch] = useState<string[]>([]);
    
    const calculateChange = (lastPrice?: string, open?: string) => {
        return Number(lastPrice) - Number(open)
    }

    useEffect(() => mapArrayDashboardList(), [lastQuotes])

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

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
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

    const sendMessageQuotes = () => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();
            symbolList.forEach(item => {
                lastQuotesRequest.addSymbolCode(item.symbolId.toString())
            });
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
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
                <div>US <span className="ms-2">01:19:03 PM</span></div>
                <div className="d-flex align-items-center justify-content-end">
                    <select className="form-select form-select-sm lh-1 me-2 w-5">
                        <option>Zone</option>
                        <option value="1" >SG</option>
                        <option value="2">JP</option>
                    </select>
                    <span>02:19:03 AM</span>
                </div>
            </div>
        </div>
    )

    const getTickerInfo = (value: ITickerInfo) => {
        handleTickerSearch(value.ticker);
        setTicker(value);
    }

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
    }

    const handleTickerSearch = (value: string) => {
        const itemTicker = handleSymbolList.find(item => item.ticker === value.toLocaleUpperCase());
        let symbolId = {};
        if (itemTicker) {
            setTicker(itemTicker);
            symbolId = itemTicker.symbolId;
            if (symbolId && lastQuotes) {
                const dataSearch = lastQuotes.find(item => Number(item.symbolCode) === symbolId);
                return setDataSearchTicker(dataSearch ? {...dataSearch, ticker: itemTicker.ticker} : defaultTickerSearch);
            }
            setTicker(defaultTickerInfo);
            return setDataSearchTicker(defaultTickerSearch);
        }
        setTicker(defaultTickerInfo);
        return setDataSearchTicker(defaultTickerSearch);
    }
    return (
        <div className="site-main">
            <div className="container">
                {setGeneralTemplate()}
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-7 mb-3">
                        <TickerDashboard handleTickerInfo={getTickerInfo} listDataTicker={handleSymbolList} />
                    </div>
                    <div className="col-xs-12 col-sm-12 col-lg-12 col-xl-2 mb-3">
                        <div>
                            <OrderBook isDashboard={isDashboard}
                                        listDataTicker={handleSymbolList}
                                        itemTickerSearch={handleTickerSearch}
                                        dataSearchTicker={dataSearchTicker}
                                        listTickerSearch={listTickerSearch}
                                        tickerDetailLastQuote={getTickerInfo}/>
                        </div>
                        <div>
                            <StockInfo listDataTicker={handleSymbolList} detailTicker={ticker}/>
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