import { useCallback, useEffect, useMemo, useState } from "react"
import { calcCeilFloorPrice, calcChange, calcPctChange, checkValue, convertNumber, formatCurrency, formatNumber, getClassName } from "../../helper/utils"
import { ILastQuote, ISymbolInfo, ISymbolQuote } from "../../interfaces/order.interface";
import * as qmpb from "../../models/proto/query_model_pb";
import { wsService } from "../../services/websocket-service";
import './TickerDashboard.scss';
import { IQuoteEvent } from "../../interfaces/quotes.interface";
import React from "react";

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
    const [symbol, setSymbol] = useState<any>();
    const [symbolCodes, setSymbolCodes] = useState<string[]>([]);
    const [quoteMap, setQuoteMap] = useState<Map<string, ISymbolQuote>>();
    const [symbolQuoteEvent, setSymbolQuoteEvent] = useState<ISymbolQuote[]>([]);

    const queryModelPb: any = qmpb;

    useEffect(() => {
        const symbols = wsService.getSymbolListSubject().subscribe(resp => {
            if (resp && resp.symbolList) {
                const symbCodes: string[] = [];
                const symbolMap = new Map();
                resp.symbolList.forEach(item => {
                    if (item.symbolStatus !== queryModelPb.SymbolStatus.SYMBOL_DEACTIVE) {
                        symbolMap.set(item?.symbolCode, item);
                        symbCodes.push(item?.symbolCode);
                    }
                })
                setSymbol(symbolMap);
                setSymbolCodes(symbCodes);
            }
        });

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
    }, [lastQuotes, symbolCodes, symbol])

    useEffect(() => {
        setUpDataDisplay();
    }, [quoteMap, symbolCodes, JSON.stringify(symbolQuoteEvent)])

    const processLastQuote = (quotes: ILastQuote[]) => {
        const itemQuoteMap = new Map();
        if (quotes.length > 0) {
            quotes.forEach(quote => {
                let symbolInfo: any = null;
                if (symbol) {
                    symbolInfo = symbol.get(quote?.symbolCode);
                }
                const {ceilingPrice, floorPrice} = calcCeilFloorPrice(convertNumber(quote?.currentPrice), symbolInfo)

                const prepareQuote: ISymbolQuote = {
                    symbolCode: quote?.symbolCode,
                    symbolId: symbolInfo?.symbolId || 0,
                    symbolName: symbolInfo?.symbolName,
                    prevClosePrice: formatCurrency(symbolInfo?.prevClosePrice),
                    high: formatCurrency(quote?.high || '0.00'),
                    low: formatCurrency(quote?.low || '0.00'),
                    lastPrice: formatCurrency(quote?.currentPrice),
                    open: formatCurrency(quote?.open || '0.00'),
                    volume: quote?.volumePerDay,
                    ceiling: formatCurrency(String(ceilingPrice)),
                    floor: formatCurrency(String(floorPrice)),
                    change: calcChange(quote?.currentPrice, symbolInfo?.prevClosePrice),
                    pctChange: calcPctChange(quote?.currentPrice, symbolInfo?.prevClosePrice)
                }
                itemQuoteMap.set(quote?.symbolCode, prepareQuote);
            });
        } else {
            symbolCodes.forEach(symbolCode => {
                const symbolInfo = symbol.get(symbolCode);
                if (symbolInfo) {
                    const quote: ISymbolQuote = {
                        symbolCode: symbolInfo.symbolCode,
                        symbolId: symbolInfo.symbolId,
                        symbolName: symbolInfo.symbolName,
                        prevClosePrice: formatCurrency(symbolInfo?.prevClosePrice),
                        high: '0.00',
                        low: '0.00',
                        lastPrice: '0.00',
                        open: '0.00',
                        volume: '0',
                        ceiling: formatCurrency(symbolInfo?.ceiling),
                        floor: formatCurrency(symbolInfo?.floor),
                        change: '0.00',
                        pctChange: '0.00'
                    };
                    itemQuoteMap.set(symbolCode, quote);
                }
            });
        }
        setQuoteMap(itemQuoteMap);
    }

    const processQuoteEvent = (quotes: IQuoteEvent[]) => {
        if (quotes && quotes.length > 0) {
            const tempSymbolQuote: ISymbolQuote[] = [];
            quotes.forEach(quote => {
                if (quote && quoteMap) {
                    let quoteUpdate = quoteMap.get(quote?.symbolCode);
                    if (quoteUpdate) {
                        // IMPORTANT: Must replace comma because Number(1,000) => exception
                        const _lastPrice = checkValue(quoteUpdate?.lastPrice?.replaceAll(',', ''), quote?.currentPrice);
                        const _volume = checkValue(quoteUpdate?.volume?.replaceAll(',', ''), quote?.volumePerDay);
                        const _high = checkValue(quoteUpdate?.high?.replaceAll(',', ''), quote?.high);
                        const _low = checkValue(quoteUpdate?.low?.replaceAll(',', ''), quote?.low);
                        const _open = checkValue(quoteUpdate?.open?.replaceAll(',', ''), quote?.open);

                        const {ceilingPrice, floorPrice} = calcCeilFloorPrice(convertNumber(_lastPrice), quoteUpdate)

                        quoteUpdate = {
                            ...quoteUpdate,
                            lastPrice: formatCurrency(_lastPrice),
                            volume: _volume,
                            high: formatCurrency(_high),
                            low: formatCurrency(_low),
                            open: formatCurrency(_open),
                            change: calcChange(_lastPrice, quoteUpdate?.prevClosePrice.replaceAll(',', '')),
                            pctChange: calcPctChange(_lastPrice, quoteUpdate?.prevClosePrice.replaceAll(',', '')),
                            ceiling: formatCurrency(String(ceilingPrice)),
                            floor: formatCurrency(String(floorPrice)),
                        }
                        quoteMap.set(quote?.symbolCode, quoteUpdate);

                        tempSymbolQuote.push({
                            symbolCode: quote?.symbolCode,
                            symbolId: quoteUpdate?.symbolId || 0,
                            symbolName: quoteUpdate.symbolName,
                            prevClosePrice: quoteUpdate?.prevClosePrice,
                            high: quote?.high || '0.00',
                            low: quote?.low || '0.00',
                            lastPrice: quote?.currentPrice,
                            open: quote?.open || '0.00',
                            volume: quote?.volumePerDay,
                            ceiling: formatCurrency(String(ceilingPrice)),
                            floor: formatCurrency(String(floorPrice)),
                            change: calcChange(quote?.currentPrice, quoteUpdate?.prevClosePrice?.replaceAll(',', '')),
                            pctChange: calcPctChange(quote?.currentPrice, quoteUpdate?.prevClosePrice?.replaceAll(',', ''))
                        })
                    }
                }
            });
            setSymbolQuoteEvent(tempSymbolQuote);
        }
    }

    const setUpDataDisplay = () => {
        let data: ISymbolQuote[] = [];
        if (quoteMap) {
            symbolCodes.forEach(symbolCode => {
                const quote = quoteMap.get(symbolCode);
                if (quote) {
                    data.push(quote);
                }
            });
            data = data.sort((a, b) => a?.symbolCode?.localeCompare(b?.symbolCode));
        }
        setListData(data);
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

    const renderDataListCompany = () => {
        return listData.map((item: ISymbolQuote, index) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)} className={`"pointer_dashboard" ${item.symbolCode === symbolCode ? 'table-active' : ''}`}>
                <td className="text-left w-header fw-600" title={item.symbolName}>{item.symbolCode}</td>
                <td className="text-end w-header fw-600">{item.prevClosePrice}</td>
                <td className="text-end w-header fw-600">{item.ceiling}</td>
                <td className="text-end w-header fw-600">{item.floor}</td>
                <td className="text-end w-header fw-600">{item.open}</td>
                <td className="text-end w-header fw-600">{item.high}</td>
                <td className="text-end w-header fw-600">{item.low}</td>
                <td className="text-end w-header fw-600">
                    {convertNumber(item.lastPrice) !== 0 && <span className={getClassName(convertNumber(item.lastPrice) - convertNumber(item.prevClosePrice))}>{item.lastPrice}</span>}
                    {convertNumber(item.lastPrice) === 0 && <span className="text-center">{item.lastPrice}</span>}
                </td>
                <td className="text-end w-header fw-600">{formatNumber(item.volume)}</td>
                <td className="text-end w-header fw-600">
                    {convertNumber(item.lastPrice) !== 0 && <span className={getClassName(convertNumber(item?.change))}>
                        {item?.change}
                    </span>}
                    {convertNumber(item.lastPrice) === 0 && <span className="text-center">-</span>}
                </td>
                <td className="text-end w-change-pct fw-600 align-middle">
                    {convertNumber(item.lastPrice) !== 0 && <span className={getClassName(convertNumber(item?.change))}>
                        {item?.pctChange}%
                    </span>}
                    {convertNumber(item.lastPrice) === 0 && <span className="text-center">-</span>}
                </td>
            </tr>
        ))
    }

    const renderDataList = useMemo(() => renderDataListCompany(), [listData, symbolCode])

    const _renderTableData = () => (
        <div className="tableFixHead max-height-72">
            <table id="table" className="table table-sm table-hover mb-0" >
                <thead>
                    {headerTable()}
                </thead>

                <tbody className="bt-none fs-14">
                    {renderDataList}
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

export default React.memo(TickerDashboard)