import { useEffect, useState } from "react"
import { calcChange, calcPctChange, checkValue, convertNumber, formatCurrency, formatNumber, getClassName } from "../../helper/utils"
import { ILastQuote, ISymbolQuote } from "../../interfaces/order.interface";
import * as psbp from "../../models/proto/pricing_service_pb";
import * as qmpb from "../../models/proto/query_model_pb";
import * as rpcpb from '../../models/proto/rpc_pb';
import { wsService } from "../../services/websocket-service";
import './TickerDashboard.scss';
import { IQuoteEvent } from "../../interfaces/quotes.interface";

interface ITickerDashboard {
    handleTickerInfo: (item: ISymbolQuote) => void;
    symbolCode: string;
}

const defaultProps = {
    handleTickerInfo: null,
}

const TickerDashboard = (props: ITickerDashboard) => {
    const { handleTickerInfo, symbolCode } = props;
    const [tickerCode, setTickerCode] = useState(symbolCode);
    const [listData, setListData] = useState<ISymbolQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [symbolList, setSymbolList] = useState<ISymbolQuote[]>([]);

    const queryModelPb: any = qmpb;

    useEffect(() => {
        const symbols = wsService.getSymbolListSubject().subscribe(resp => {
            if (resp && resp.symbolList) {
                const temp: any[] = [];
                resp.symbolList.forEach(item => {
                    if (item.symbolStatus !== queryModelPb.SymbolStatus.SYMBOL_DEACTIVE) {
                        temp.push(item);
                    }
                })
                setSymbolList(temp);
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
            let temp: ISymbolQuote[] = [];
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
            temp = temp.sort((a, b) => a?.symbolCode?.localeCompare(b?.symbolCode));
            setListData(temp);
        } else {
            let temp: ISymbolQuote[] = [];
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
            temp = temp.sort((a, b) => a?.symbolCode?.localeCompare(b?.symbolCode));
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

    const headerTable = () => (
        <tr>
            <th className="text-left sorting_disabled header-cell w-header fz-14">Ticker Code</th>
            <th className=" text-end sorting_disabled header-cell w-header fz-14">Close</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Limit Up</th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">Limit Down</th>
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

    const renderDataListCompany = () => (
        listData.map((item: ISymbolQuote, index) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)} className={`"pointer_dashboard" ${item.symbolCode === symbolCode && 'table-active'}`}>
                <td className="text-left w-header fw-600" title={item.symbolName}>{item.symbolCode}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.prevClosePrice)}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.ceiling)}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.floor)}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.open)}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.high)}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.low)}</td>
                <td className="text-end w-header fw-600">
                     {convertNumber(item.lastPrice) !== 0 && <span className={getClassName(convertNumber(item.lastPrice) - convertNumber(item.prevClosePrice))}>{formatCurrency(item.lastPrice)}</span>}
                     {convertNumber(item.lastPrice) === 0 && <span className="text-center">{formatCurrency(item.lastPrice)}</span>}
                </td>
                <td className="text-end w-header fw-600">{formatNumber(item.volume)}</td>
                <td className="text-end w-header fw-600">
                     {convertNumber(item.lastPrice) !== 0 && <span className={getClassName(convertNumber(calcChange(item.lastPrice, item.prevClosePrice)))}>
                        {calcChange(item.lastPrice, item.prevClosePrice)}
                     </span>}
                     {convertNumber(item.lastPrice) === 0 && <span className="text-center">-</span>}
                </td>
                <td className="text-end w-change-pct fw-600 align-middle">
                    {convertNumber(item.lastPrice) !== 0 && <span className={getClassName(convertNumber(calcChange(item.lastPrice, item.prevClosePrice)))}>
                        {calcPctChange(item.lastPrice, item.prevClosePrice)}%
                    </span>}
                    {convertNumber(item.lastPrice) === 0 && <span className="text-center">-</span>}
                </td>
            </tr>
        ))
    )

    const _renderTableData = () => (
        <div className="tableFixHead max-height-69">
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