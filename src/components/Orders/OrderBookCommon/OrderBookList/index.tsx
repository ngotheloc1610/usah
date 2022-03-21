import { useEffect, useState } from 'react';
import { MARKET_DEPTH_LENGTH } from '../../../../constants/general.constant';
import { TITLE_LIST_BID_ASK, TITLE_LIST_BID_ASK_COLUMN, TITLE_LIST_BID_ASK_COLUMN_GAB, TITLE_LIST_BID_ASK_SPREADSHEET } from '../../../../constants/order.constant';
import { IAskAndBidPrice, ILastQuote, IListAks, IListAskBid, IListBid, IPropsListBidsAsk } from '../../../../interfaces/order.interface';
import './OrderBoolListBidsAsk.scss';
import * as tdpb from '../../../../models/proto/trading_model_pb';
import { wsService } from '../../../../services/websocket-service';
import { IQuoteEvent } from '../../../../interfaces/quotes.interface';
import { checkValue, convertNumber, formatCurrency } from '../../../../helper/utils';

const defaultAskBidList: IListAskBid[] = [
    {
        totalBids: '',
        numberBids: '',
        bidPrice: '',
        askPrice: '',
        numberAsks: '',
        totalAsks: '',
        tradableAsk: false,
        tradableBid: false,
        volumeAsk: '',
        volumeBid: ''
    }
]
const OrderBookList = (props: IPropsListBidsAsk) => {
    const { styleListBidsAsk, symbolCode, getTicerLastQuote, handleSide } = props;
    const [listAsksBids, setListAsksBids] = useState<IListAskBid[]>(defaultAskBidList);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [quotesEvent, setQuotesEvent] = useState<IQuoteEvent[]>([]);
    const tradingModel: any = tdpb;
    const [asksList, setAsksList] = useState<IListAks[]>([])
    const [bidsList, setBidsList] = useState<IListBid[]>([])

    useEffect(() => {
        const lastQuoteResponse = wsService.getDataLastQuotes().subscribe(lastQuote => {
            if (lastQuote && lastQuote.quotesList) {
                setLastQuotes(lastQuote.quotesList);
            }
        });
        const quoteEventResponse = wsService.getQuoteSubject().subscribe(quotes => {
            if (quotes && quotes.quoteList) {
                setQuotesEvent(quotes.quoteList);
            }
        })
        return () => {
            lastQuoteResponse.unsubscribe();
            quoteEventResponse.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processLastQuote(lastQuotes);
    }, [lastQuotes, symbolCode])

    useEffect(() => {
        processQuoteEvent(quotesEvent)
    }, [quotesEvent, styleListBidsAsk])

    const processLastQuote = (quotes: ILastQuote[]) => {
        if (quotes && quotes.length > 0) {
            const quote = quotes.find(o => o?.symbolCode === symbolCode);
            if (quote) {
                mapDataTable(quote?.asksList, quote?.bidsList);
            }
        }
    }

    const processQuoteEvent = (quotes: IQuoteEvent[]) => {
        if (quotes && quotes.length > 0) {
            const quote = quotes.find(o => o?.symbolCode === symbolCode);
            if (quote) {
                mapDataTable(quote?.asksList, quote?.bidsList);
            }
        }
        const tempLastQuote = [...lastQuotes];
        quotes.forEach(item => {
            if (item) {
                const index = tempLastQuote.findIndex(o => o?.symbolCode === item?.symbolCode);
                if (index >= 0) {
                    tempLastQuote[index] = {
                        ...tempLastQuote[index],
                        asksList: item.asksList,
                        bidsList: item.bidsList,
                        currentPrice: checkValue(tempLastQuote[index].currentPrice, item?.currentPrice),
                        open: checkValue(tempLastQuote[index]?.open, item?.open),
                        high: checkValue(tempLastQuote[index]?.high, item?.high),
                        low: checkValue(tempLastQuote[index]?.low, item?.low),
                        close: checkValue(tempLastQuote[index]?.close, item.close)
                    }
                }
            }
        });
        setLastQuotes(tempLastQuote);

    }

    const mapDataTable = (asksList: IAskAndBidPrice[], bidsList: IAskAndBidPrice[]) => {
        let counter = MARKET_DEPTH_LENGTH - 1;
        let assgnListAsksBids: IListAskBid[] = [];
        const askList = styleListBidsAsk?.earmarkSpreadSheet || styleListBidsAsk?.spreadsheet ? asksList.sort((a, b) => b?.price.localeCompare(a?.price)) : asksList.sort((a, b) => a?.price.localeCompare(b?.price));
        const bidList = styleListBidsAsk.columns || styleListBidsAsk.columnsGap ? bidsList.sort((a, b) => b?.price.localeCompare(a?.price)) : bidsList.sort((a, b) => a?.price.localeCompare(b?.price));

        getAskList(askList)
        getBisList(bidList)

        while (counter >= 0) {
            if (askList[counter] || bidList[counter]) {
                const tradableBid = (bidList[counter] && bidList[counter].tradable) ? bidList[counter].tradable : false;
                const volumeBid = (bidList[counter] && bidList[counter].volume) ? bidList[counter].volume : '-';
                const tradableAsk = (askList[counter] && askList[counter].tradable) ? askList[counter].tradable : false;
                const volumeAsk = (askList[counter] && askList[counter].volume) ? askList[counter].volume : '-';
                const askPrice = (askList[counter] && askList[counter].price) ? Number(askList[counter].price).toFixed(2) : '-';
                const bidPrice = (bidList[counter] && bidList[counter].price) ? Number(bidList[counter].price).toFixed(2) : '-';
                const numberAsks = (askList[counter] && askList[counter].volume) ? askList[counter].volume.toString() : '-';
                const numberBids = (bidList[counter] && bidList[counter].volume) ? bidList[counter].volume.toString() : '-';
                const isAskNumOrder = askList[counter] && askList[counter].numOrders;
                const isBidNumOrder = bidList[counter] && bidList[counter].numOrders;
                assgnListAsksBids.push(
                    {
                        tradableBid: tradableBid,
                        volumeBid: volumeBid,
                        tradableAsk: tradableAsk,
                        volumeAsk: volumeAsk,
                        askPrice: askPrice,
                        bidPrice: bidPrice,
                        numberAsks: numberAsks,
                        numberBids: numberBids,
                        totalAsks: counter === (MARKET_DEPTH_LENGTH - 1) ?
                            numberAsks : isAskNumOrder ? (convertNumber(numberAsks) + convertNumber(assgnListAsksBids[assgnListAsksBids.length - 1].totalAsks)).toString() : numberAsks,
                        totalBids: counter === (MARKET_DEPTH_LENGTH - 1) ?
                            numberBids : isBidNumOrder ? (convertNumber(numberBids) + convertNumber(assgnListAsksBids[assgnListAsksBids.length - 1].totalBids)).toString() : numberBids,
                    }
                )
            } else {
                assgnListAsksBids.push(
                    {
                        askPrice: '-',
                        bidPrice: '-',
                        numberAsks: '-',
                        numberBids: '-',
                        totalAsks: '-',
                        totalBids: '-',
                        tradableAsk: false,
                        volumeAsk: '-',
                        tradableBid: false,
                        volumeBid: '-'
                    }
                )
            }
            counter--;
        }
        setListAsksBids(assgnListAsksBids);
    }

    const getAskList = (asksList: IAskAndBidPrice[]) => {
        let askItems: IAskAndBidPrice[] = asksList;
        let arr: IListAks[] = [];
        let counter = MARKET_DEPTH_LENGTH - 1;
        while (counter >= 0) {
            if (askItems[counter]) {
                const numberAsks = askItems[counter].numOrders ? askItems[counter].volume.toString() : '-';
                const askPrice = askItems[counter].price ? Number(askItems[counter].price).toFixed(2) : '-';
                const tradableAsk = askItems[counter].tradable ? askItems[counter].tradable : false;
                const volumeAsk = askItems[counter].volume ? askItems[counter].volume : '-';
                const isAskNumOrder = askItems[counter] && askItems[counter].numOrders;
                arr.push({
                    numberAsks: numberAsks,
                    askPrice: askPrice,
                    tradableAsk: tradableAsk,
                    volumeAsk: volumeAsk,
                    totalAsks: counter === (MARKET_DEPTH_LENGTH - 1) ? numberAsks : isAskNumOrder ? (convertNumber(numberAsks) + convertNumber(arr[arr.length - 1].totalAsks)).toString() : numberAsks,
                });
            } else {
                arr.push({
                    numberAsks: '-',
                    askPrice: '-',
                    tradableAsk: false,
                    volumeAsk: '-',
                    totalAsks: '-',
                });
            }
            counter--;
        }
        setAsksList(arr)
    }

    const getBisList = (bidsList: IAskAndBidPrice[]) => {
        let bidItems: IAskAndBidPrice[] = bidsList;
        let arr: IListBid[] = [];
        let counter = 0;
        while (counter < MARKET_DEPTH_LENGTH) {
            if (bidItems[counter]) {
                const numberBids = bidItems[counter].numOrders ? bidItems[counter].volume.toString() : '-';
                const bidPrice = bidItems[counter].price ? Number(bidItems[counter].price).toFixed(2) : '-';
                const tradableBid = bidItems[counter].tradable ? bidItems[counter].tradable : false;
                const volumeBid = bidItems[counter].volume ? bidItems[counter].volume : '-';
                const isBidNumOrder = bidItems[counter] && bidItems[counter].numOrders;;
                arr.push({
                    numberBids: numberBids,
                    bidPrice: bidPrice,
                    tradableBid: tradableBid,
                    volumeBid: volumeBid,
                    totalBids: counter === 0 ? numberBids : isBidNumOrder ? (convertNumber(numberBids) + convertNumber(arr[0].totalBids)).toString() : numberBids,
                });
            } else {
                arr.push({
                    numberBids: '-',
                    bidPrice: '-',
                    tradableBid: false,
                    volumeBid: '-',
                    totalBids: '-',
                });
            }
            counter++;
        }
        setBidsList(arr)
    }

    const handleTicker = (itemTicker: IListAskBid, side: number) => {
        if (side === tradingModel.Side.BUY) {
            const itemAssign: IAskAndBidPrice = {
                numOrders: Number(itemTicker.numberAsks),
                price: itemTicker.askPrice,
                tradable: itemTicker.tradableAsk,
                volume: itemTicker.volumeAsk,
            }
            getTicerLastQuote(itemAssign);
            handleSide(side)
            return;
        }
        const itemAssign: IAskAndBidPrice = {
            numOrders: Number(itemTicker.numberBids),
            price: itemTicker.bidPrice,
            tradable: itemTicker.tradableBid,
            volume: itemTicker.volumeBid,
        }
        getTicerLastQuote(itemAssign);
        handleSide(side);
        return;
    }

    const handleTickerGridColumnAsk = (itemTicker: IListAks, side: number) => {
        const itemAssign: IAskAndBidPrice = {
            numOrders: Number(itemTicker.numberAsks),
            price: itemTicker.askPrice,
            tradable: itemTicker.tradableAsk,
            volume: itemTicker.volumeAsk,
        }
        getTicerLastQuote(itemAssign);
        handleSide(side)
        return;
    }

    const handleTickerGridColumnBid = (itemTicker: IListBid, side: number) => {
        const itemAssign: IAskAndBidPrice = {
            numOrders: Number(itemTicker.numberBids),
            price: itemTicker.bidPrice,
            tradable: itemTicker.tradableBid,
            volume: itemTicker.volumeBid,
        }
        getTicerLastQuote(itemAssign);
        handleSide(side);
        return;
    }

    const _renderTitleStyleEarmarkSpreadSheet = () => (
        TITLE_LIST_BID_ASK.map((item, index) => {
            return <th key={index} className="border-end">{item}</th>
        })
    )

    const _renderDataStyleEarmarkSpreadSheet = () => {
        return listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{convertNumber(item.totalBids) === 0 ? '-' : convertNumber(item.totalBids)}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{convertNumber(item.volumeBid) === 0 ? '-' : convertNumber(item.volumeBid)}</td>
                <td className="text-end border-end border-bottom-0 text-danger" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{item.bidPrice === '-' ? '-' : formatCurrency(item.bidPrice)}</td>
                <td className="text-end border-end border-bottom-0 text-success" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{item.askPrice === '-' ? '-' : formatCurrency(item.askPrice)}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{convertNumber(item.volumeAsk) === 0 ? '-' : convertNumber(item.volumeAsk)}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{convertNumber(item.totalAsks) === 0 ? '-' : convertNumber(item.totalAsks)}</td>
            </tr>
        })
    }

    const _renderTitleStyleSpreadsheet = () => (
        TITLE_LIST_BID_ASK_SPREADSHEET.map((item, index) => {
            return <th key={index} className="border-end">{item}</th>
        })
    )

    const _renderDataStyleSpreadsheet = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{convertNumber(item.totalAsks) === 0 ? '-' : convertNumber(item.totalAsks)}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{convertNumber(item.volumeAsk) === 0 ? '-' : convertNumber(item.volumeAsk)}</td>
                <td className="text-end border-end border-bottom-0 text-success" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{item.askPrice === '-' ? '-' : formatCurrency(item.askPrice)}</td>
                <td className="text-end border-end border-bottom-0 text-danger" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{item.bidPrice === '-' ? '-' : formatCurrency(item.bidPrice)}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{convertNumber(item.volumeBid) === 0 ? '-' : convertNumber(item.volumeBid)}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{convertNumber(item.totalBids) === 0 ? '-' : convertNumber(item.totalBids)}</td>
            </tr>
        })
    )

    const _renderDataEmp = () => (
        <>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">
                    {styleListBidsAsk.earmarkSpreadSheet && <strong>{listAsksBids[listAsksBids.length - 1].totalBids}</strong>}
                    {styleListBidsAsk.spreadsheet && <strong>{listAsksBids[listAsksBids.length - 1].totalAsks}</strong>}
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    {styleListBidsAsk.earmarkSpreadSheet && <strong>UNDER</strong>}
                    {styleListBidsAsk.spreadsheet && <strong>OVER</strong>}
                </td>
                <td className="text-end border-end border-bottom-0">
                    {styleListBidsAsk.earmarkSpreadSheet && <strong>OVER</strong>}
                    {styleListBidsAsk.spreadsheet && <strong>UNDER</strong>}
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    {styleListBidsAsk.earmarkSpreadSheet && <strong>{listAsksBids[listAsksBids.length - 1].totalAsks}</strong>}
                    {styleListBidsAsk.spreadsheet && <strong>{listAsksBids[listAsksBids.length - 1].totalBids}</strong>}
                </td>
            </tr>
        </>
    )

    const _renderTableEarmarkSpreadSheet = () => (
        <table className="table table-sm table-hover border mb-0">
            <thead>
                <tr>
                    {styleListBidsAsk.earmarkSpreadSheet && _renderTitleStyleEarmarkSpreadSheet()}
                    {styleListBidsAsk.spreadsheet && _renderTitleStyleSpreadsheet()}
                </tr>
            </thead>
            <tbody>
                {styleListBidsAsk.earmarkSpreadSheet && _renderDataStyleEarmarkSpreadSheet()}
                {styleListBidsAsk.spreadsheet && _renderDataStyleSpreadsheet()}
                {_renderDataEmp()}
            </tbody>
        </table>
    )

    const _renderTitleStyleGirdAsk = () => (
        TITLE_LIST_BID_ASK.slice(0, 3).map((item, index) => {
            return <th className="text-end" key={index}>{item}</th>
        })
    )

    const _renderDataStyleGirdBid = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end" onClick={() => handleTicker(item, tradingModel.Side.SELL)}><span>{convertNumber(item.totalBids) === 0 ? '-' : convertNumber(item.totalBids)}</span></td>
                <td className="text-end" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{convertNumber(item.volumeBid) === 0 ? '-' : convertNumber(item.volumeBid)}</td>
                <td className="text-end text-danger" onClick={() => handleTicker(item, tradingModel.Side.SELL)}>{item.bidPrice === '-' ? '-' : formatCurrency(item.bidPrice)}</td>
            </tr>
        })
    )

    const _renderTitleStyleGirdBids = () => (
        TITLE_LIST_BID_ASK.slice(3, 6).reverse().map((item, index) => {
            return <th key={index} className="text-end">{item}</th>
        })
    )

    const _renderDataStyleGirdAsk = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end" onClick={() => handleTicker(item, tradingModel.Side.BUY)}><span>{convertNumber(item.totalAsks) === 0 ? '-' : convertNumber(item.totalAsks)}</span></td>
                <td className="text-end" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{convertNumber(item.volumeAsk) === 0 ? '-' : convertNumber(item.volumeAsk)}</td>
                <td className="text-end text-success" onClick={() => handleTicker(item, tradingModel.Side.BUY)}>{item.askPrice === '-' ? '-' : formatCurrency(item.askPrice)}</td>
            </tr>
        })
    )

    const _renderTableGidBids = () => (
        <div className="order-block table-responsive">
            <table className="table table-sm border table-borderless table-hover mb-0">
                <thead>
                    <tr>
                        {_renderTitleStyleGirdBids()}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="text-end"><strong>{convertNumber(listAsksBids[listAsksBids.length - 1].totalAsks) === 0 ? '-' : convertNumber(listAsksBids[listAsksBids.length - 1].totalAsks)}</strong></td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end"><strong>OVER</strong></td>
                    </tr>

                    {_renderDataStyleGirdAsk()}
                    <tr>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
            <table className="table table-sm border table-borderless table-hover mb-0">
                <thead>
                    <tr>
                        {_renderTitleStyleGirdAsk()}
                    </tr>
                </thead>
                <tbody>
                    {_renderDataStyleGirdBid()}
                    <tr>
                        <td className="text-end" colSpan={2}>&nbsp;</td>
                        <td className="text-end"><span className="text-success">&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td className="text-end">
                            <strong>
                                {convertNumber(listAsksBids[listAsksBids.length - 1].totalBids) === 0 ? '-' : convertNumber(listAsksBids[listAsksBids.length - 1].totalBids)}
                            </strong>
                        </td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end"><strong>UNDER</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )

    const _renderTitleStyleColumns = () => (
        TITLE_LIST_BID_ASK_COLUMN.map((item, index) => {
            return <th key={index} className='text-end'>{item}</th>
        })
    )

    const _renderDataStyleColumnsAsk = () => (
        asksList.map((item, index) => {
            return <tr key={index}>
                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className="text-end" colSpan={2}>&nbsp;</td>
                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className={`text-end ${((index + 1) === listAsksBids.length) && 'bg-success-light text-success'}`}>
                    {item.askPrice === '-' ? '-' : formatCurrency(item.askPrice)}</td>
                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className="text-end">{convertNumber(item.volumeAsk) === 0 ? '-' : convertNumber(item.volumeAsk)}</td>
                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className="text-end">{convertNumber(item.totalAsks) === 0 ? '-' : convertNumber(item.totalAsks)}</td>
            </tr>
        })

    )

    const _renderDataStyleColumnsBids = () => (
        bidsList.map((item, index) => {
            return <tr key={index}>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className="text-end">
                    {convertNumber(item.totalBids) === 0 ? '-' : convertNumber(item.totalBids)}
                </td>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className="text-end">{convertNumber(item.volumeBid) === 0 ? '-' : convertNumber(item.volumeBid)}</td>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className={`text-end ${index === 0 && 'text-danger'}`}>
                    {item.bidPrice === '-' ? '-' : formatCurrency(item.bidPrice)}
                </td>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className="text-end" colSpan={2}>&nbsp;</td>
            </tr>
        })
    )

    const _renderTitleStyleColumnsGap = () => (

        TITLE_LIST_BID_ASK_COLUMN_GAB.map((item, index) => {
            return <th key={index} className='text-end'>{item}</th>
        })
    )

    const _renderDataStyleColumnsGapAsk = () => (
        asksList.map((item, index) => {
            return <tr key={index}>
                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className="text-end">{convertNumber(item.totalAsks) === 0 ? '-' : convertNumber(item.totalAsks)}</td>
                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className="text-end">{convertNumber(item.volumeAsk) === 0 ? '-' : convertNumber(item.volumeAsk)}</td>

                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className={`text-end ${(index + 1) === listAsksBids.length && 'text-success'}`}>
                    {item.askPrice === '-' ? '-' : formatCurrency(item.askPrice)}</td>
                <td onClick={() => handleTickerGridColumnAsk(item, tradingModel.Side.BUY)} className="text-end" colSpan={2}>&nbsp;</td>

            </tr>
        })

    )

    const _renderDataStyleColumnsGapBid = () => (
        bidsList.map((item, index) => {
            return <tr key={index}>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className="text-end" colSpan={2}>&nbsp;</td>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className={`text-end ${index === 0 && 'text-danger bg-danger-light'}`}>
                    {item.bidPrice === '-' ? '-' : formatCurrency(item.bidPrice)}
                </td>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className="text-end">{convertNumber(item.volumeBid) === 0 ? '-' : convertNumber(item.volumeBid)}</td>
                <td onClick={() => handleTickerGridColumnBid(item, tradingModel.Side.SELL)} className="text-end">
                    {convertNumber(item.totalBids) === 0 ? '-' : convertNumber(item.totalBids)}
                </td>
            </tr>
        })
    )


    const _renderTableColumns = () => (
        <table className="table table-sm table-borderless table-hover border mb-0">
            <thead>
                <tr>
                    {_renderTitleStyleColumns()}
                </tr>
            </thead>
            <tbody className='tbody-grid-order-book'>
                <tr>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                    <td className="text-end"><strong>OVER</strong></td>
                    <td className="text-end" colSpan={2}>
                        <strong>
                            {convertNumber(listAsksBids[listAsksBids.length - 1].totalAsks) === 0 ? '-' : convertNumber(listAsksBids[listAsksBids.length - 1].totalAsks)}
                        </strong>
                    </td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                {_renderDataStyleColumnsAsk()}
                {_renderDataStyleColumnsBids()}
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp; </td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end">
                        <strong>
                            {convertNumber(listAsksBids[listAsksBids.length - 1].totalBids) === 0 ? '-' : convertNumber(listAsksBids[listAsksBids.length - 1].totalBids)}
                        </strong>
                    </td>
                    <td className="text-end">&nbsp;</td>
                    <td className="text-end"><strong>UNDER</strong></td>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                </tr>
            </tbody>
        </table>
    )

    const _renderTableColumnsGap = () => (
        <table className="table table-sm table-borderless table-hover border mb-0">
            <thead>
                <tr>
                    {_renderTitleStyleColumnsGap()}
                </tr>
            </thead>
            <tbody className='tbody-grid-order-book'>
                <tr>
                    <td className="text-end" >
                        <strong>
                            {convertNumber(listAsksBids[listAsksBids.length - 1].totalAsks) === 0 ? '-' : convertNumber(listAsksBids[listAsksBids.length - 1].totalAsks)}
                        </strong>
                    </td>
                    <td className="text-end">&nbsp;</td>
                    <td className="text-end">OVER</td>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                {_renderDataStyleColumnsGapAsk()}
                {_renderDataStyleColumnsGapBid()}
                <tr>
                    <td className="text-end" colSpan={4}>&nbsp; </td>
                    <td className="text-end">

                    </td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                    <td className="text-end">UNDER</td>
                    <td className="text-end" colSpan={2}>
                        <strong>
                            {convertNumber(listAsksBids[listAsksBids.length - 1].totalBids) === 0 ? '-' : convertNumber(listAsksBids[listAsksBids.length - 1].totalBids)}
                        </strong>
                    </td>
                </tr>
            </tbody>
        </table>
    )


    return <div className="order-block table-responsive mb-2 fz-14">
        {(styleListBidsAsk.earmarkSpreadSheet || styleListBidsAsk.spreadsheet) && _renderTableEarmarkSpreadSheet()}
        {styleListBidsAsk.grid && _renderTableGidBids()}
        {styleListBidsAsk.columns && _renderTableColumns()}
        {styleListBidsAsk.columnsGap && _renderTableColumnsGap()}
    </div>
};
export default OrderBookList;