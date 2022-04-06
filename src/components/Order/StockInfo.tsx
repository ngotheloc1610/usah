import { useEffect, useState } from "react";
import { LIST_TICKER_INFO } from "../../constants/general.constant";
import { checkValue, formatCurrency, formatNumber } from "../../helper/utils";
import { ILastQuote, ITickerInfo } from "../../interfaces/order.interface";
import { IQuoteEvent } from "../../interfaces/quotes.interface";
import { wsService } from "../../services/websocket-service";

interface IStockInfo {
    listDataTicker: ITickerInfo[];
    symbolCode: string;
}

const StockInfo = (props: IStockInfo) => {
    const { symbolCode } = props;
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [lastQuote, setLastQuote] = useState<ILastQuote[]>([]);
    const [minBidSize, setMinBidSize] = useState(0);
    const [lotSize, setLotSize] = useState(0);
    const [volume, setVolume] = useState(0);
    const [high, setHigh] = useState(0);
    const [low, setLow] = useState(0);

    useEffect(() => {
        const lastQuote = wsService.getDataLastQuotes().subscribe(lastQuote => {
            if (lastQuote && lastQuote.quotesList) {
                setLastQuote(lastQuote.quotesList);
            }
        })
        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });
        return () => {
            quoteEvent.unsubscribe();
            lastQuote.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processLastQuote(lastQuote);
    }, [lastQuote, symbolCode])

    useEffect(() => {
        processQuoteEvent(quoteEvent);
    }, [quoteEvent])

    const processLastQuote = (lastQuote: ILastQuote[]) => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const symbol = symbols.find(o => o?.symbolCode === symbolCode);
        if (symbol) {
            setMinBidSize(symbol.tickSize);
            setLotSize(symbol.lotSize)
            const quote = lastQuote.find(o => o?.symbolCode === symbolCode);
            if (quote) {
                setVolume(Number(quote.volumePerDay));
                setHigh(Number(quote.high));
                setLow(Number(quote.low));
            }
        } else {
            setMinBidSize(0);
            setLotSize(0)
            setVolume(0);
            setHigh(0);
            setLow(0);
        }
    }

    const processQuoteEvent = (quotes: IQuoteEvent[]) => {
        const quote = quotes.find(o => o?.symbolCode === symbolCode);
        if (quote) {
            const volumeChange = checkValue(volume, quote.volumePerDay);
            const highChange = checkValue(high, quote.high);
            const lowChange = checkValue(low, quote.low);
            setVolume(Number(volumeChange));
            setHigh(Number(highChange));
            setLow(Number(lowChange));
        }
        const tmpLastQuote = [...lastQuote];
        quotes.forEach(item => {
            const idx = tmpLastQuote.findIndex(o => o?.symbolCode === item?.symbolCode);
            if (idx >= 0) {
                tmpLastQuote[idx] = {
                    ...tmpLastQuote[idx],
                    high: checkValue(tmpLastQuote[idx]?.high, item?.high),
                    volumePerDay: checkValue(tmpLastQuote[idx]?.volumePerDay, item?.volumePerDay),
                    low: checkValue(tmpLastQuote[idx]?.low, item?.low)
                }
            }
        });
        setLastQuote(tmpLastQuote);
    }

    return <>
        <div className="card">
            <div className="card-header">
                <h6 className="card-title mb-0"><i className="bi bi-info-circle"></i> Stock Infomation</h6>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-sm mb-0" cellSpacing="0" cellPadding="0">
                        <tbody>
                            <tr>
                                <th className="fs-14">Tick Size</th>
                                <td className="text-end fw-600">{minBidSize && formatCurrency(minBidSize.toString())}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Lot Size</th>
                                <td className="text-end fw-600">{lotSize}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Volume</th>
                                <td className="text-end fw-600">{volume && formatNumber(volume.toString())}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}

export default StockInfo