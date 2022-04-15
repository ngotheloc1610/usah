import { LIST_TICKER_INFO, MARKET_DEPTH_LENGTH } from "../../constants/general.constant"
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from "../../interfaces/order.interface"
import { DEFAULT_DATA_TICKER, DEFAULT_CURRENT_TICKER, ORDER_BOOK_HEADER } from "../../mocks"
import '../TickerDashboard/TickerDashboard.scss';
import * as tdpb from '../../models/proto/trading_model_pb';
import { checkValue, formatCurrency, formatNumber } from "../../helper/utils";
import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import TickerDetail from "./TickerDetail";
import { wsService } from "../../services/websocket-service";


interface IOrderBookProps {
    isDashboard: boolean;
    listDataTicker?: ITickerInfo[];
    itemTickerSearch: (item: string) => void;
    listTickerSearch?: string[];
    tickerDetailLastQuote: (item: IAskAndBidPrice) => void;
    currentTicker?: ITickerInfo;
    symbolCode?:  string;
    handleSide?: (side: number) => void;
}

const defaultProps = {
    isDashboard: false
}

const OrderBook = (props: IOrderBookProps) => {
    const { isDashboard, itemTickerSearch, listTickerSearch, tickerDetailLastQuote, symbolCode, handleSide } = props;
    const tradingModel: any = tdpb;
    const [lastQuote, setLastQuote] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState([]);
    const [quote, setQuote] = useState<ILastQuote>(DEFAULT_DATA_TICKER);
    const [ticker, setTicker] = useState<string>('');

    useEffect(() => {
        const getLastQuote = wsService.getDataLastQuotes().subscribe(lastQuote => {
            if (lastQuote && lastQuote.quotesList) {
                setLastQuote(lastQuote.quotesList);
            }
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(quotes => {
            if (quotes && quotes.quoteList) {
                setQuoteEvent(quotes.quoteList);
            }
        })

        return () => {
            getLastQuote.unsubscribe();
            quoteEvent.unsubscribe();
        }
    }, [])

    useEffect(() => {
        setTicker(symbolCode || '');
    }, [symbolCode])

    useEffect(() => {
        processLastQuote(lastQuote);
    }, [lastQuote, ticker])

    useEffect(() => {
        processQuoteEvent(quoteEvent);
    }, [quoteEvent])

    const processLastQuote = (quotes: ILastQuote[]) => {
        const item = quotes.find(o => o?.symbolCode === ticker)
        item ? setQuote(item) : setQuote(DEFAULT_DATA_TICKER)
    }

    const processQuoteEvent = (quotes: ILastQuote[]) => {
        if (quote) {
            let temp = { ...quote };
            const item = quotes.find(o => o?.symbolCode === quote?.symbolCode);
            if (item) {
                temp = {
                    ...temp,
                    asksList: item.asksList,
                    bidsList: item.bidsList,
                    currentPrice: checkValue(temp?.currentPrice, item?.currentPrice),
                    close: checkValue(temp?.close, item?.close),
                    high: checkValue(temp?.high, item?.high),
                    low: checkValue(temp?.low, item?.low),
                    open: checkValue(temp?.open, item?.open)
                }
                setQuote(temp);
            }

            let tempLastQuote = [...lastQuote];
            quotes.forEach(item => {
                const index = tempLastQuote.findIndex(o => o?.symbolCode === item?.symbolCode);
                if (index >= 0) {
                    tempLastQuote[index] = {
                        ...tempLastQuote[index],
                        asksList: item?.asksList,
                        bidsList: item?.bidsList,
                        currentPrice: checkValue(tempLastQuote[index]?.currentPrice, item?.currentPrice)
                    }
                }
            });
            setLastQuote(tempLastQuote);
        }

    }

    const _renderAskPrice = (itemData: ILastQuote) => {
        let askItems: IAskAndBidPrice[] = itemData.asksList;
        let arr: IAskAndBidPrice[] = [];
        let counter = MARKET_DEPTH_LENGTH - 1;
        while (counter >= 0) {
            if (askItems[counter]) {
                arr.push({
                    numOrders: askItems[counter].numOrders,
                    price: askItems[counter].price,
                    tradable: askItems[counter].tradable,
                    volume: askItems[counter].volume,
                    symbolCode: itemData.symbolCode,
                });
            } else {
                arr.push({
                    numOrders: 0,
                    price: '-',
                    tradable: false,
                    volume: '-',
                    symbolCode: itemData.symbolCode
                });
            }
            counter--;
        }
        return arr.map((item: IAskAndBidPrice, index: number) => (
            <tr key={index} onClick={() => handleTicker(item, tradingModel.Side.BUY)}>
                <td className="text-end bg-success-light fw-600 text-success d-flex justify-content-between">
                    <div>{`${item.numOrders !== 0 ? `(${item.numOrders})` : ''}`}</div>
                    <div>{item.volume !== '-' ? formatNumber(item.volume.toString()) : '-'}</div>
                </td>
                <td className="fw-bold text-center">
                    {item.price !== '-' ? formatCurrency(item.price.toString()) : '-'}</td>
                <td className="text-end fw-600" >&nbsp;</td>
            </tr>
        ));
    }

    const _renderBidPrice = (itemData: ILastQuote) => {
        let bidItems: IAskAndBidPrice[] = itemData.bidsList;
        let arr: IAskAndBidPrice[] = [];
        let counter = 0;
        while (counter < MARKET_DEPTH_LENGTH) {
            if (bidItems[counter]) {
                arr.push({
                    numOrders: bidItems[counter].numOrders,
                    price: bidItems[counter].price,
                    tradable: bidItems[counter].tradable,
                    volume: bidItems[counter].volume,
                    symbolCode: itemData.symbolCode
                });
            } else {
                arr.push({
                    numOrders: 0,
                    price: '-',
                    tradable: false,
                    volume: '-',
                    symbolCode: itemData.symbolCode
                });
            }
            counter++;
        }
        return arr.map((item: IAskAndBidPrice, index: number) => (
            <tr key={index} onClick={() => handleTicker(item, tradingModel.Side.SELL)}>
                <td className="text-end fw-600">&nbsp;</td>
                <td className="fw-bold text-center fw-600">
                    {item.price !== '-' ? formatCurrency(item.price.toString()) : '-'}</td>
                <td className="text-end bg-danger-light fw-600 d-flex justify-content-between">
                    <div>{`${item.numOrders !== 0 ? `(${item.numOrders})` : ''}`}</div>
                    <div>{item.volume !== '-' ? formatNumber(item.volume.toString()) : '-'}</div>
                </td>
            </tr>
        ));
    }

    const _renderHeaderOrderBook = () => (
        ORDER_BOOK_HEADER.map((item: string, index: number) => (
            <th className="text-uppercase text-center" key={index}>
                <span className="text-ellipsis">{item.split(' ')[0]}<br />{item.split(' ')[1]}</span>
            </th>
        ))
    )

    const _renderTilte = () => (
        <div className="text-uppercase small text-secondary mb-2"><strong>Order Book</strong></div>
    )

    const handleKeyUp = (event: any) => {
        const value = event.target?.value || event.target?.innerText;
        setTicker(value);
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const symbol = symbols.find(o => o?.symbolCode?.includes(value));
        if (symbol) {
            itemTickerSearch(value);
        } else {
            itemTickerSearch('');
        }
    }
    const _renderSearchBox = () => (
        <div className="card-header-style">
            <div className="input-group input-group-sm dark">
                <Autocomplete
                    className='ticker-search'
                    onChange={(event: any) => handleKeyUp(event)}
                    onKeyUp={(event: any) => handleKeyUp(event)}
                    value={ticker}
                    disablePortal
                    sx={{ width: 300 }}
                    options={listTickerSearch ? listTickerSearch : []}
                    renderInput={(params) => <TextField {...params} placeholder="Search" />}
                />
            </div>
        </div>
    )

    const handleTicker = (item: IAskAndBidPrice, side: number) => {
        tickerDetailLastQuote(item);
        if (handleSide) {
            handleSide(side);
        }
    }

    const _renderTemplate = () => (
        <>
            {!isDashboard && _renderTilte()}
            {isDashboard && _renderSearchBox()}
            <div className="text-uppercase small text-secondary mb-4">
                <div className="table-responsive">
                    <table cellPadding="0" cellSpacing="0" className="table border table-sm mb-0">
                        <thead>
                            <tr className="align-middle">
                                {_renderHeaderOrderBook()}
                            </tr>
                        </thead>
                        <tbody>
                            {_renderAskPrice(quote)}
                            <tr className="bg-light">
                                <td className="text-center" colSpan={3}>
                                    <span className="fs-5 fw-bold text-primary">{(quote && quote.currentPrice !== '') ? formatCurrency(quote.currentPrice) : '-'}</span>
                                </td>
                            </tr>
                            {_renderBidPrice(quote)}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )

    return <div>{_renderTemplate()}</div>
}

OrderBook.defaultProps = defaultProps

export default OrderBook