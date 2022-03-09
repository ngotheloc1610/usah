import { useEffect, useState } from "react";
import { checkValue } from "../../helper/utils";
import { ITickerInfo } from "../../interfaces/order.interface";
import { IQuoteEvent } from "../../interfaces/quotes.interface";
import { wsService } from "../../services/websocket-service";

interface IStockInfo {
    listDataTicker: ITickerInfo[];
    detailTicker?: ITickerInfo;
}

const StockInfo = (props: IStockInfo) => {
    const [detailTicker, setDetailTicker] = useState(props.detailTicker);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);

    useEffect(() => {
        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });
        return () => {
            quoteEvent.unsubscribe();
        }
    }, [])
    useEffect(() => {
        setDetailTicker(props.detailTicker);
    }, [props.detailTicker])
    useEffect(() => {
        const itemChange = quoteEvent?.find(item => item?.symbolId === detailTicker?.symbolId);
        const itemData = { ...detailTicker };
        
        if (itemChange) {
            const assignData: ITickerInfo = {
                change: detailTicker?.change ? detailTicker.change : '',
                changePrecent: detailTicker?.changePrecent ? detailTicker?.changePrecent : '',
                high: detailTicker?.high,
                lastPrice: detailTicker?.lastPrice ? detailTicker?.lastPrice : '',
                lotSize: detailTicker?.lotSize,
                low: detailTicker?.low,
                minLot: detailTicker?.minLot,
                open: detailTicker?.open,
                previousClose: detailTicker?.previousClose,
                symbolId: detailTicker?.symbolId ? detailTicker?.symbolId : 0,
                tickSize: detailTicker?.tickSize,
                ticker: detailTicker?.ticker ? detailTicker?.ticker : '',
                tickerName: detailTicker?.tickerName ? detailTicker?.tickerName : '',
                volume: checkValue(itemData.volume, itemChange?.volumePerDay),
            }
            setDetailTicker(assignData);
        }
    }, [quoteEvent])
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
                                <th className="fs-14">Mininum bid size</th>
                                <td className="text-end fw-600">{detailTicker?.tickSize}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Lot size</th>
                                <td className="text-end fw-600">{detailTicker?.lotSize}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">Volume</th>
                                <td className="text-end fw-600">{detailTicker?.volume}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">52w High</th>
                                <td className="text-end fw-600">{detailTicker?.high}</td>
                            </tr>
                            <tr>
                                <th className="fs-14">52w Low</th>
                                <td className="text-end fw-600">{detailTicker?.low}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
}

export default StockInfo