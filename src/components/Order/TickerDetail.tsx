import { useEffect, useState } from 'react'
import { LIST_TICKER_INFO } from '../../constants/general.constant'
import { calcChange, calcPctChange, checkValue, formatCurrency, formatNumber } from '../../helper/utils'
import { ILastQuote, ITickerInfo } from '../../interfaces/order.interface'
import { IQuoteEvent } from '../../interfaces/quotes.interface'
import { ITickerDetail } from '../../interfaces/ticker.interface'
import { DEFAULT_TICKER_DATA } from '../../mocks'
import '../../pages/Orders/OrderNew/OrderNew.scss'
import { wsService } from '../../services/websocket-service'

interface ITickerDetailProps {
    currentTicker: ITickerInfo;
    symbolCode: string
}

const defaultProps = {
    currentTicker: {},
    symbolId: ''
}

const defaultTickerDetails: ITickerDetail = {
    symbolId: 0,
    tickerName: '-',
    ticker: '-',
    stockPrice: '0',
    previousClose: '0',
    open: '0',
    high: '0',
    low: '0',
    lastPrice: '0',
    volume: '0',
    change: '0',
    changePrecent: '0',
    lotSize: '0',
    minimumBizSize: '0'
}

const TickerDetail = (props: ITickerDetailProps) => {
    const { currentTicker, symbolCode } = props;
    const [lastQuote, setLastQuote] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [tickerInfo, setTickerInfo] = useState(currentTicker);

    useEffect(() => {
        const getLastQuote = wsService.getDataLastQuotes().subscribe(lastQuotes => {
            if (lastQuotes && lastQuotes.quotesList) {
                setLastQuote(lastQuotes.quotesList);
            }
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        return () => {
            quoteEvent.unsubscribe();
            getLastQuote.unsubscribe();
        }

    }, [])

    useEffect(() => {
        processLastQuote(lastQuote);
    }, [lastQuote, symbolCode]);

    useEffect(() => {
        processQuoteEvent(quoteEvent);
    }, [quoteEvent])

    useEffect(() => {
        symbolCode === '' && setTickerInfo(DEFAULT_TICKER_DATA);
    }, [symbolCode])

    const processLastQuote = (quotes: ILastQuote[]) => {
        const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const symbol = symbolsList.find(o => o?.symbolCode === symbolCode);
        if (symbol) {
            const item = quotes.find(o => o?.symbolCode === symbolCode);
            if (item) {
                setTickerInfo({
                    ...symbol,
                    asks: item?.asksList,
                    bids: item?.bidsList,
                    high: item?.high,
                    lastPrice: item?.currentPrice,
                    open: item?.open,
                    low: item?.low,
                    previousClose: item?.close,
                    volume: item?.volume,
                    lotSize: symbol.lotSize
                });
            }
        }
    }

    const processQuoteEvent = (quoteEvent: IQuoteEvent[]) => {
        const tempTickerInfo = {...tickerInfo};
        const item = quoteEvent.find(o => o?.symbolCode === symbolCode);
        if (item) {
            setTickerInfo({
                ...tempTickerInfo,
                    asks: item?.asksList,
                    bids: item?.bidsList,
                    high: checkValue(tempTickerInfo.high, item.high),
                    lastPrice: checkValue(tempTickerInfo.lastPrice, item.currentPrice),
                    open: checkValue(tempTickerInfo.open, item.open),
                    low: checkValue(tempTickerInfo.low, item.low),
                    previousClose: checkValue(tempTickerInfo.previousClose, item.close)
            })
        };

        const tempLastQuote = [...lastQuote];
        quoteEvent.forEach(ele => {
            const index = tempLastQuote.findIndex(o => o?.symbolCode === ele?.symbolCode);
            if (index >= 0) {
                tempLastQuote[index] = {
                    ...tempLastQuote[index],
                    asksList: ele.asksList,
                    bidsList: ele.bidsList,
                    currentPrice: checkValue(tempLastQuote[index]?.currentPrice, ele?.currentPrice),
                    close: checkValue(tempLastQuote[index]?.close, ele?.close),
                    high: checkValue(tempLastQuote[index]?.high, ele?.high),
                    low: checkValue(tempLastQuote[index]?.low, ele?.low),
                    open: checkValue(tempLastQuote[index]?.open, ele?.open),
                    volumePerDay: checkValue(tempLastQuote[index]?.volumePerDay, ele?.volumePerDay),
                    quoteTime: checkValue(tempLastQuote[index]?.quoteTime, ele?.quoteTime)
                }
            }
        });
        setLastQuote(tempLastQuote);

    }

    const _renderIconTicker = (changeDisplay: number) => (
        <i className={changeDisplay < 0 ? 'bi bi-arrow-down' : 'bi bi-arrow-up'}></i>
    )

    const _renderLastPriceTemplate = (lastPrice: string, change: string, changePercent: string) => {
        const lastPriceDisplay = lastPrice ? lastPrice : defaultTickerDetails.lastPrice;
        const changeDisplay = formatNumber(calcChange(tickerInfo.lastPrice, tickerInfo.open || '').toString());
        const changePercentDisplay = formatCurrency(calcPctChange(tickerInfo.lastPrice, tickerInfo.open || '').toString());
        let textColor = '';
        if (Number(changeDisplay) === 0) {
            textColor = 'text-warning';
        } else if (Number(changeDisplay) < 0) {
            textColor = 'text-success';
        } else {
            textColor = 'text-danger';
        }
        return (
            <td className="text-end w-precent-19">
                <div className={`${textColor} fs-20 fw-bold lastPriceStyle fw-600`}>
                    {Number(changeDisplay) !== 0 && _renderIconTicker(Number(changeDisplay))}
                    {formatCurrency(lastPriceDisplay)}
                </div>
                <div className={`${textColor} fw-600`}>
                    {formatCurrency(changeDisplay)}
                    ({formatCurrency(changePercentDisplay)}%)
                </div>
            </td>
        )

    }

    const _renderLastPrice = () => (
        <tr className="align-middle">
            <th className='w-precent-15'>
                <div>Last Price</div>
                <div className='mt-10'>Change</div>
            </th>
            {_renderLastPriceTemplate(tickerInfo.lastPrice, tickerInfo.change, tickerInfo.changePrecent)}
            <th className='w-precent-15'>Open</th>
            <td className="text-end fw-600">{tickerInfo.open ? formatNumber(tickerInfo.open) : defaultTickerDetails.open}</td>
        </tr>
    )

    const _renderGeneralTemplate = (title1: string, value1: string, title2: string, value2: string) => (
        <tr className="align-middle">
            <th>
                <div className="h-50px">{title1}</div>
            </th>
            <td className="text-end fw-600 w-precent-41">{value1}</td>
            <th className='w-precent-15'>{title2}</th>
            <td className="text-end fw-600">{value2}</td>
        </tr>
    )

    const _renderMiniumSize = () => (
        <tr className="align-middle">
            <th className='w-precent-15'>
                <div>Min Lot</div>
                <div className='mt-10'>Tick Size</div>
            </th>
            <td className="text-end fw-600 w-precent-41">
                <div>{formatNumber(tickerInfo?.minLot ? tickerInfo.minLot : '0')}</div>
                <div>{formatNumber(tickerInfo?.tickSize ? tickerInfo.tickSize : '0')}</div>
            </td>
            <th className='w-precent-15'>Low</th>
            <td className="text-end fw-600">{formatNumber(tickerInfo?.low ? tickerInfo?.low : '0')}</td>
        </tr>
    )

    const _renderTickerDetail = () => {
        const high = (tickerInfo?.high) ? tickerInfo.high.toString() : '0';
        const lotSize = (tickerInfo?.lotSize) ? tickerInfo.lotSize.toString() : '0';
        return <div>
        <div className="text-uppercase small text-secondary mb-2"><strong>Ticker Detail</strong></div>
        <div className="table-responsive">
            <table cellPadding="0" cellSpacing="0" className="table border table-i table-sm">
                <tbody className='fs-17'>
                    {_renderLastPrice()}
                    {_renderGeneralTemplate('Lot Size', lotSize, 'High', formatNumber(high))}
                    {_renderMiniumSize()}
                </tbody>
            </table>
        </div>
    </div>
    }
    return <div>{_renderTickerDetail()}</div>
}

TickerDetail.defaultProps = defaultProps;

export default TickerDetail