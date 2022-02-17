import { LIST_TICKER_INFO, MARKET_DEPTH_LENGTH } from "../../constants/general.constant"
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from "../../interfaces/order.interface"
import {  DEFAULT_DATA_TICKER, DEFAULT_CURRENT_TICKER, ORDER_BOOK_HEADER } from "../../mocks"
import '../TickerDashboard/TickerDashboard.scss';
import * as tdpb from '../../models/proto/trading_model_pb';
import { formatCurrency, formatNumber } from "../../helper/utils";
import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import TickerDetail from "./TickerDetail";


interface IOrderBookProps {
    isDashboard: boolean;
    listDataTicker?: ITickerInfo[];
    itemTickerSearch: (item: string) => void;
    dataSearchTicker?: ILastQuote;
    listTickerSearch?: string[];
    tickerDetailLastQuote : (item: ITickerInfo) => void;
}

const defaultProps = {
    isDashboard: false
}

const OrderBook = (props: IOrderBookProps) => {
    const { isDashboard, itemTickerSearch, dataSearchTicker, listTickerSearch, tickerDetailLastQuote } = props;
    const [tickerSearch, setTickerSearch] = useState<string>(dataSearchTicker?.ticker ? dataSearchTicker.ticker : '');
    const tradingModel: any = tdpb;
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
                    symbolCode: '-',
                });
            }
            counter--;
        }
        return arr.map((item: IAskAndBidPrice, index: number) => (
            <tr key={index} onClick={() => handleTicker(item, tradingModel.OrderType.OP_BUY, itemData)}>
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
    useEffect(() => {
        setTickerSearch(dataSearchTicker?.ticker ? dataSearchTicker.ticker : '');
    }, [dataSearchTicker?.ticker]);
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
                    symbolCode: '-'
                });
            }
            counter++;
        }
        return arr.map((item: IAskAndBidPrice, index: number) => (
            <tr key={index} onClick={() => handleTicker(item, tradingModel.OrderType.OP_SELL, itemData)}>
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
    
    const handleKeyUp = (value: string) => {
        itemTickerSearch(value);
    }
    const _renderSearchBox = () => (
        <div className="card-header-style">
            <div className="input-group input-group-sm dark">
                <Autocomplete
                    className='ticker-input'
                    onChange={(event: any) => handleKeyUp(event.target.innerText)}
                    onKeyUp={(event: any) => handleKeyUp(event.target.value)}
                    disablePortal
                    sx={{ width: 300 }}
                    options={listTickerSearch ? listTickerSearch : []}
                    renderInput={(params) => <TextField {...params} placeholder="Search" />}
                />
            </div>
        </div>
    )

    const handleTicker = (item: IAskAndBidPrice, side: string, lastQuote: ILastQuote) => {
        const listSymbolListLocal = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '{}');
        const detailTickerLocal = listSymbolListLocal.find(item => item.symbolId === Number(lastQuote.symbolCode));
        let tickerDetail: ITickerInfo = DEFAULT_CURRENT_TICKER;
        const itemPrice = item.price === '-' ? '0' : item.price;
        const itemVolume = item.volume === '-' ? '0' : item.volume;
        if (detailTickerLocal) {
            tickerDetail = {...detailTickerLocal, volume: itemVolume, lastPrice: itemPrice, side: side};
        }
        tickerDetailLastQuote(tickerDetail);
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
                            {_renderAskPrice(dataSearchTicker ? dataSearchTicker : DEFAULT_DATA_TICKER)}
                            <tr className="bg-light">
                                <td className="text-center" colSpan={3}>
                                    <span className="fs-5 fw-bold text-primary">{(dataSearchTicker && dataSearchTicker.currentPrice !== '') ? dataSearchTicker.currentPrice : '-'}</span>
                                </td>
                            </tr>
                            {_renderBidPrice(dataSearchTicker ? dataSearchTicker : DEFAULT_DATA_TICKER)}
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