import { useEffect, useState } from 'react';
import { LIST_PRICE_TYPE, LIST_TICKER_INFO } from '../../../../constants/general.constant';
import { ItemsPage } from '../../../../constants/news.constant';
import { assignListPrice, calcChange, calcPctChange, checkValue, convertNumber, formatCurrency, formatNumber, getClassName } from '../../../../helper/utils';
import { ILastQuote, IPropsDetail } from '../../../../interfaces/order.interface';
import { IQuoteEvent } from '../../../../interfaces/quotes.interface';
import { DEFAULT_DATA_TICKER } from '../../../../mocks';
import { wsService } from '../../../../services/websocket-service';
import './OrderBookTickerDetail.css';

const OrderBookTickerDetail = (props: IPropsDetail) => {
    const { symbolCode } = props;
    const [tickerInfo, setTickerInfo] = useState<ILastQuote>(DEFAULT_DATA_TICKER);
    const [lastQuote, setLastQuote] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [floorPrice, setFloorPrice] = useState(0);
    const [ceilingPrice, setCeilingPrice] = useState(0);
    const [lotSize, setLotSize] = useState(0);
    const [vwap, setVwap] = useState(0);
    useEffect(() => {
        if (tickerInfo.symbolCode) {
            const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const ticker = tickerList.find(item => item.symbolCode === symbolCode);
            const lotSize = ticker?.lotSize;
            setFloorPrice(Number(ticker?.floor));
            setCeilingPrice(Number(ticker?.ceiling));
            setLotSize(Number(lotSize));
        }
    }, [tickerInfo])

    useEffect(() => {
        const lastQuoteResponse = wsService.getDataLastQuotes().subscribe(resp => {
            if (resp && resp.quotesList) {
                setLastQuote(resp.quotesList);
            }
        });

        const quoteEventResponse = wsService.getQuoteSubject().subscribe(quotes => {
            if (quotes && quotes.quoteList) {
                setQuoteEvent(quotes.quoteList);
            }
        })

        return () => {
            lastQuoteResponse.unsubscribe();
            quoteEventResponse.unsubscribe();
        }

    }, [])

    useEffect(() => {
        processLastQuote(lastQuote);
    }, [lastQuote, symbolCode])

    useEffect(() => {
        processQuoteEvent(quoteEvent);
    }, [quoteEvent])

    const processLastQuote = (quotes: ILastQuote[]) => {
        const symbolLocalList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]');
        const itemTickerInfor = symbolLocalList.find(o => o?.symbolCode === symbolCode);
        if (quotes && quotes.length > 0) {
            let item: ILastQuote = quotes.find(o => o?.symbolCode === symbolCode) || DEFAULT_DATA_TICKER;
            const tmpItem: ILastQuote = {
                asksList: item.asksList,
                bidsList: item.bidsList,
                close: itemTickerInfor?.prevClosePrice,
                currentPrice: item.currentPrice,
                high: item.high,
                low: item.low,
                open: item.open,
                quoteTime: item.quoteTime,
                scale: item.scale,
                symbolCode: itemTickerInfor?.symbolCode,
                symbolId: itemTickerInfor?.symbolId,
                tickPerDay: item.tickPerDay,
                volumePerDay: item.volumePerDay,
                volume: item.volumePerDay
            }
            item ? setTickerInfo(tmpItem) : setTickerInfo(DEFAULT_DATA_TICKER);
        }
    }

    const processQuoteEvent = (quotes: IQuoteEvent[]) => {
        const symbolLocalList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]');
        const itemTickerInfor = symbolLocalList.find(o => o?.symbolCode === symbolCode);
        if (quotes && quotes.length > 0) {
            let temp = { ...tickerInfo };
            const index = quotes.findIndex(o => o?.symbolCode === temp?.symbolCode);
            if (index >= 0) {
                temp = {
                    ...temp,
                    asksList: quotes[index]?.asksList,
                    bidsList: quotes[index]?.bidsList,
                    close: itemTickerInfor?.prevClosePrice,
                    currentPrice: checkValue(temp?.currentPrice, quotes[index]?.currentPrice),
                    high: checkValue(temp?.high, quotes[index]?.high),
                    low: checkValue(temp?.low, quotes[index]?.low),
                    open: checkValue(temp?.open, quotes[index]?.open),
                    quoteTime: checkValue(temp?.quoteTime, quotes[index]?.quoteTime),
                    scale: checkValue(temp?.scale, quotes[index]?.scale),
                    tickPerDay: checkValue(temp?.tickPerDay, quotes[index]?.tickPerDay)
                };
                setTickerInfo(temp);
            }

            // Update lastquote
            const tempLastQuote = [...lastQuote];
            quotes.forEach(item => {
                const idx = tempLastQuote.findIndex(o => o?.symbolCode === item?.symbolCode);
                if (idx >= 0) {
                    tempLastQuote[idx] = {
                        ...tempLastQuote[idx],
                        asksList: item?.asksList,
                        bidsList: item?.bidsList,
                        close: itemTickerInfor?.prevClosePrice,
                        currentPrice: checkValue(tempLastQuote[idx]?.currentPrice, item?.currentPrice),
                        high: checkValue(tempLastQuote[idx]?.high, item?.high),
                        low: checkValue(tempLastQuote[idx]?.low, item?.low),
                        open: checkValue(tempLastQuote[idx]?.open, item?.open),
                        quoteTime: checkValue(tempLastQuote[idx]?.quoteTime, item?.quoteTime),
                        scale: checkValue(tempLastQuote[idx]?.scale, item?.scale),
                        tickPerDay: checkValue(tempLastQuote[idx]?.tickPerDay, item?.tickPerDay)
                    }
                }
            });
            setLastQuote(tempLastQuote);

            calVWAP(quoteEvent)
        }
    }

    const calVWAP = (quoteEvent: IQuoteEvent[]) => {
        const askList = quoteEvent[0].asksList || [];
        const bidsList = quoteEvent[0].bidsList || [];
        let totalNumeratorVwap = 0;
        let totalVolume = 0;
        if (askList.length > 0) {
            askList?.map(item => {
                totalNumeratorVwap += (Number(item.price) * Number(item.volume));
                totalVolume += Number(item.volume);
            });
        }
        if (bidsList.length > 0) {
            bidsList?.map(item => {
                totalNumeratorVwap += (Number(item.price) * Number(item.volume));
                totalVolume += Number(item.volume);
            });
        }
        const resultVWAP = totalVolume > 0 ? totalNumeratorVwap / totalVolume : 0;
        setVwap(resultVWAP);
    }

    const getTicker = (symbolCode: string) => {
        const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]');
        return tickerList.find(item => item.symbolCode === symbolCode);
    }

    return <>
        <div className="card-header">
            {symbolCode !== "" ? <h6 className="card-title mb-0" title={getTicker(symbolCode)?.symbolName}>{getTicker(symbolCode)?.symbolCode}</h6> : <h6 className="card-title mb-0">&nbsp;</h6>}
        </div>
        <div className="card-body">
            <div className="row">
                <div className="col-3">
                    <table className="table table-sm table-borderless table-py-0 mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Last price</strong></td>
                                <td className="text-end">
                                    {Number(tickerInfo.currentPrice) > Number(tickerInfo.open) && <span className='text-danger'>{formatCurrency(tickerInfo.currentPrice)}</span>}
                                    {Number(tickerInfo.currentPrice) < Number(tickerInfo.open) && <span className='text-success'>{formatCurrency(tickerInfo.currentPrice)}</span>}
                                    {Number(tickerInfo.currentPrice) === Number(tickerInfo.open) && <span>{formatCurrency(tickerInfo.currentPrice)}</span>}
                                </td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Open</strong></td>
                                <td className="text-end">{formatCurrency(tickerInfo.open || '')}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">High</strong></td>
                                <td className="text-end">{formatCurrency(tickerInfo.high || '')}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Low</strong></td>
                                <td className="text-end">{formatCurrency(tickerInfo.low || '')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-6">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            <tr>
                                <td><strong className="text-table">Change</strong></td>
                                <td className="text-end">
                                    {convertNumber(tickerInfo.currentPrice) !== 0  
                                        ? <span className={`${getClassName(convertNumber(calcChange(tickerInfo.currentPrice, tickerInfo.close || '')))}`}>
                                                {calcChange(tickerInfo.currentPrice, tickerInfo.close || '')}
                                            </span>
                                        : <span className="text-center">{formatCurrency('0')}</span>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Change%</strong></td>
                                <td className="text-end">
                                    {convertNumber(tickerInfo.currentPrice) !== 0  
                                        ? <span className={`${getClassName(convertNumber(calcPctChange(tickerInfo.currentPrice, tickerInfo.close || '')))}`}>
                                                {calcPctChange(tickerInfo.currentPrice, tickerInfo.close || '')}
                                            </span>
                                        : <span className="text-center">{formatCurrency('0')}</span>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Daily Trading Vol</strong></td>
                                <td className="text-end">{formatNumber(tickerInfo.volumePerDay.toString())}</td>
                            </tr>
                            {/* TODO: No Display follow #52146 bug */}
                            {/* <tr>
                                <td><strong className="text-table">5-Day Average Trading Vol</strong></td>
                                <td className="text-end">-</td>
                            </tr> */}
                        </tbody>
                    </table>
                </div>
                <div className="col-3">
                    <table className="table table-sm table-borderless mb-0">
                        <tbody>
                            {/* TODO: No Display follow #52146 bug */}
                            {/* <tr>
                                <td><strong className="text-table">VWAP</strong></td>
                                <td className="text-end">{formatCurrency(vwap.toString())}</td>
                            </tr> */}
                            <tr>
                                <td><strong className="text-table">Lot Size</strong></td>
                                <td className="text-end">{symbolCode ? lotSize : formatCurrency('0')}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Limit Down</strong></td>
                                <td className="text-end">{symbolCode ? floorPrice : formatCurrency('0')}</td>
                            </tr>
                            <tr>
                                <td><strong className="text-table">Limit Up</strong></td>
                                <td className="text-end">{symbolCode ? ceilingPrice : formatCurrency('0')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}
export default OrderBookTickerDetail;