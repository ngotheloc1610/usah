import { useEffect, useState } from "react"
import { SOCKET_CONNECTED, LIST_TICKER_INFO, LIST_PRICE_TYPE, SYMBOL_LIST } from "../../constants/general.constant"
import { assignListPrice, calcChange, calcPctChange, checkValue, formatCurrency, formatNumber } from "../../helper/utils"
import { IDetailTickerInfo, ILastQuote, ISymbolQuote, ITickerInfo } from "../../interfaces/order.interface";
import * as psbp from "../../models/proto/pricing_service_pb";
import * as rpcpb from '../../models/proto/rpc_pb';
import { IListDashboard } from "../../interfaces/ticker.interface";
import { wsService } from "../../services/websocket-service";
import './TickerDashboard.scss';
import { IQuoteEvent } from "../../interfaces/quotes.interface";

interface ITickerDashboard {
    handleTickerInfo: (item: ISymbolQuote) => void;
    handleQuoteEvent: (item: ITickerInfo) => void;
    listDataTicker: ITickerInfo[];
}

const defaultProps = {
    handleTickerInfo: null,
}

const TickerDashboard = (props: ITickerDashboard) => {
    const { handleTickerInfo, handleQuoteEvent, listDataTicker } = props;
    const [tickerCode, setTickerCode] = useState('');
    const [listData, setListData] = useState<ISymbolQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [symbolList, setSymbolList] = useState<ISymbolQuote[]>([])


    useEffect(() => {
        const subscribeQuoteRes = wsService.getSubscribeQuoteSubject().subscribe(resp => {
            console.log(resp);
        });

        const symbols = wsService.getSymbolListSubject().subscribe(resp => {
            if (resp && resp.symbolList) {
                setSymbolList(resp.symbolList);
            }
        })

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setLastQuotes(quote.quotesList);
            }
        })

        return () => {
            unSubscribeQuoteEvent();
            subscribeQuoteRes.unsubscribe();
            quoteEvent.unsubscribe();
            lastQuote.unsubscribe();
            symbols.unsubscribe();
        }
    }, []);

    useEffect(() => {
        processQuoteEvent(quoteEvent);
    }, [quoteEvent])

    useEffect(() => {
        processLastQuote(lastQuotes)
    }, [lastQuotes, symbolList])

    const processLastQuote = (quotes: ILastQuote[]) => {
        if (quotes.length > 0) {
            const temp: ISymbolQuote[] = [];
            symbolList.forEach(symbol => {
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
            setListData(temp);
        } else {
            const temp: ISymbolQuote[] = [];
            symbolList.forEach(symbol => {
                if (symbol) {
                    const symbolQuote: ISymbolQuote = {
                        symbolCode: symbol.symbolCode,
                        symbolId: symbol.symbolId,
                        symbolName: symbol.symbolName,
                        prevClosePrice: symbol.prevClosePrice,
                        high: '0',
                        low: '0',
                        lastPrice: '0',
                        open: '0',
                        volume: '0',
                        ceiling: symbol.ceiling,
                        floor: symbol.floor
                    };
                    const index = temp.findIndex(o => o?.symbolCode === symbolQuote?.symbolCode);
                    if (index < 0) {
                        temp.push(symbolQuote);
                    }
                }
            });
            setListData(temp);
        }
    }

    const processQuoteEvent = (quotes: IQuoteEvent[]) => {
        const tempSymbolsList = [...symbolList];
        const tempLastQuotes = [...lastQuotes];
        if (quotes && quotes.length > 0) {
            // update symbolList
            quotes.forEach(item => {
                const idx = tempSymbolsList.findIndex(o => o?.symbolCode === item?.symbolCode);
                if (idx >= 0) {
                    tempSymbolsList[idx] = {
                        ...tempSymbolsList[idx],
                        lastPrice: checkValue(tempSymbolsList[idx].lastPrice, item.currentPrice),
                        volume: checkValue(tempSymbolsList[idx].volume, item.volumePerDay),
                        high: checkValue(tempSymbolsList[idx].high, item.high),
                        low: checkValue(tempSymbolsList[idx].low, item.low),
                        open: checkValue(tempSymbolsList[idx].open, item.open),
                    }
                }
            });
            setSymbolList(tempSymbolsList);

            // update last quote
            quotes.forEach(item => {
                const index = lastQuotes.findIndex(o => o?.symbolCode === item?.symbolCode);
                if (index >= 0) {
                    tempLastQuotes[index] = {
                        ...tempLastQuotes[index],
                        asksList: item.asksList,
                        bidsList: item.bidsList,
                        currentPrice: checkValue(tempLastQuotes[index]?.currentPrice, item?.currentPrice),
                        quoteTime: checkValue(tempLastQuotes[index]?.quoteTime, item?.quoteTime),
                        scale: checkValue(tempLastQuotes[index]?.scale, item?.scale),
                        tickPerDay: checkValue(tempLastQuotes[index]?.tickPerDay, item?.tickPerDay),
                        volumePerDay: checkValue(tempLastQuotes[index]?.volumePerDay, item?.volumePerDay),
                        high: checkValue(tempLastQuotes[index]?.high, item?.high),
                        low: checkValue(tempLastQuotes[index]?.low, item?.low),
                        open: checkValue(tempLastQuotes[index]?.open, item?.open),
                    }
                }
            });
            setLastQuotes(tempLastQuotes);
        }
    }

    const unSubscribeQuoteEvent = () => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            symbolList.forEach(item => {
                unsubscribeQuoteReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const onClickTickerInfo = (item: ISymbolQuote) => {
        if (item) {
            setTickerCode(item.symbolCode);
            handleTickerInfo(item);
        }
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

    const headerTable = () => (
        <tr>
            <th className="text-left sorting_disabled header-cell w-header fz-14">Ticker Code</th>
            <th className=" text-end sorting_disabled header-cell w-header fz-14">Close</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Ceiling</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Floor</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Open</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">High</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Low</th>
            <th className=" text-end sorting_disabled header-cell w-header">
                <span className="fz-14 pl-6">Last Price</span>
            </th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Volume</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Change</th>
            <th className="text-end sorting_disabled header-cell w-change-pct fz-14">Change%</th>
        </tr>
    )

    const renderSymbolName = (symbolCode: string) => {
        if (symbolList.length > 0) {
            const item = symbolList.find(o => o?.symbolCode === symbolCode);
            if (item) {
                return item.symbolName;
            }
        }
        return '';
    }


    const renderDataListCompany = () => {
        return listData.map((item: ISymbolQuote, index) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)} className="pointer_dashboard">
                <td className="text-left w-header fw-600" title={item.symbolName}>{item.symbolCode}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.prevClosePrice || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.ceiling || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.floor || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.open || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.high || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.low || '')}</td>
                <td className="text-end w-header fw-600"><span className={getNameClass(Number(item.lastPrice))}>{formatCurrency(item.lastPrice)}</span></td>
                <td className="text-end w-header fw-600">{formatNumber(item.volume)}</td>
                <td className="text-end w-header fw-600"><span className={getNameClass(calcChange(item.lastPrice, item.open || ''))}>
                    {formatNumber(calcChange(item.lastPrice, item.open || '').toString())}
                </span></td>
                <td className="text-end w-change-pct fw-600 align-middle"><span className={getNameClass(calcPctChange(item.lastPrice, item.open || ''))}>
                    {formatCurrency(calcPctChange(item.lastPrice, item.open || '').toString())}%</span>
                </td>
            </tr>
        ))
    }

    const _renderTableData = () => (
        <div className="tableFixHead" style={{ maxHeight: '56vh' }}>
            <table id="table" className="table table-sm table-hover mb-0" >
                <thead>
                    {headerTable()}
                </thead>

                <tbody className="bt-none fs-14">
                    {renderDataListCompany()}
                </tbody>
            </table>
        </div>
    )


    const setTableData = () => (
        <div className="table-responsive bg-white">
            <div id="table_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                <div className="row">
                    <div className="col-sm-12">
                        {_renderTableData()}
                    </div>
                </div>
            </div>
        </div>
    )

    return <div className="border border-2 bg-light">
        {setTableData()}
    </div>
}

TickerDashboard.defaultProps = defaultProps

export default TickerDashboard