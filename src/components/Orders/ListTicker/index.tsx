import { useEffect, useState } from "react";
import { ACCOUNT_ID, LIST_TICKER_INFO, LIST_WATCHING_TICKERS, MARKET_DEPTH_LENGTH, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { formatCurrency, formatNumber } from "../../../helper/utils";
import { IAskAndBidPrice, ILastQuote, ISymbolInfo, IWatchList } from "../../../interfaces/order.interface";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './listTicker.scss';
import * as tdpb from '../../../models/proto/trading_model_pb';
import * as psbp from "../../../models/proto/pricing_service_pb";
import { Autocomplete, TextField } from '@mui/material';
import { pageFirst, pageSizeTicker } from "../../../constants";
import { IQuoteEvent } from "../../../interfaces/quotes.interface";
interface IListTickerProps {
    getTicerLastQuote: (item: IAskAndBidPrice) => void;
    handleSide: (side: number) => void;
    msgSuccess?: string;
}

const defaultProps = {
    getTicerLastQuote: null
}

const dafaultLastQuotesData: ILastQuote[] = [];

const ListTicker = (props: IListTickerProps) => {
    const { getTicerLastQuote, msgSuccess, handleSide } = props;
    const [lastQoutes, setLastQoutes] = useState(dafaultLastQuotesData);
    const tradingModel: any = tdpb;
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [pageShowCurrentLastQuote, setPageShowCurrentLastQuote] = useState<ILastQuote[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(pageFirst);
    const [quoteEvent, setQuoteEvent] = useState([]);
    const [listSymbol, setListSymbol] = useState<string[]>([]);
    const [symbolCodeAdd, setSymbolCodeAdd] = useState<string>('');

    const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const currentAccId = localStorage.getItem(ACCOUNT_ID);

    useEffect(() => {
        const listSymbol: string[] = []
        pageShowCurrentLastQuote.map(item => {
            listSymbol.push(item.symbolCode)
        })
        setListSymbol(listSymbol)
    }, [pageShowCurrentLastQuote])

    useEffect(() => {

        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                getOrderBooks();
                subscribeQuoteEvent(symbols);
            }
        });

        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQoutes(resp.quotesList);
        });

        const subscribeQuoteRes = wsService.getSubscribeQuoteSubject().subscribe(resp => {
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        return () => {
            const watchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
            const ownWatchList = watchList.filter(o => o?.accountId === currentAccId);
            unSubscribeQuoteEvent(ownWatchList);
            subscribeQuoteRes.unsubscribe();
            quoteEvent.unsubscribe();
            ws.unsubscribe();
            lastQuotesRes.unsubscribe();
        }
    }, []);

    useEffect(() => {
        processQuote(quoteEvent);
    }, [quoteEvent]);

    useEffect(() => {
        processLastQuote(lastQoutes)
    }, [lastQoutes, currentPage])

    const processLastQuote = (lastQoutes: ILastQuote[]) => {
        const quotes: ILastQuote[] = [];
        const watchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
        const ownWatchList = watchList.filter((o: IWatchList) => o?.accountId === currentAccId);
        lastQoutes.forEach(item => {
            if (item) {
                const idx = ownWatchList.findIndex(o => o?.symbolCode === item?.symbolCode);
                const idxQuote = quotes.findIndex(e => e?.symbolCode === item?.symbolCode);
                if (idx >= 0 && idxQuote < 0) {
                    quotes.push(item)
                }
            }
        });
        const temp = getDataCurrentPage(pageSizeTicker, currentPage, quotes);
        temp.slice((currentPage - 1) * pageSizeTicker, currentPage * pageSizeTicker - 1);
        setPageShowCurrentLastQuote(temp);
    }

    const processQuote = (quotes: IQuoteEvent[]) => {
        const tmpList = [...pageShowCurrentLastQuote];
        const tempLastQuote = [...lastQoutes];
        if (quotes && quotes.length > 0) {
            quotes.forEach(item => {
                const index = tmpList.findIndex(o => o?.symbolCode === item?.symbolCode);

                if (index >= 0) {
                    tmpList[index] = {
                        ...tmpList[index],
                        asksList: item.asksList,
                        bidsList: item.bidsList
                    }
                }

                const idx = tempLastQuote.findIndex(o => o?.symbolCode === item?.symbolCode);
                if (idx >= 0) {
                    tempLastQuote[idx] = {
                        ...tempLastQuote[idx],
                        asksList: item?.asksList,
                        bidsList: item?.bidsList
                    }
                }

            });
            // setLastQoutes(tempLastQuote);
            setPageShowCurrentLastQuote(tmpList);
        }

    }

    const subscribeQuoteEvent = (quotes: ILastQuote[]) => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            quotes.forEach(item => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            })
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }        
    }

    const unSubscribeQuoteEvent = (quotes: ILastQuote[]) => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            quotes.forEach(item => {
                unsubscribeQuoteReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }        
    }

    useEffect(() => {
        const listSymbolCode: string[] = [];
        if (symbols.length > 0) {
            symbols.forEach((item: ISymbolInfo) => {
                const displayText = `${item.symbolCode} - ${item.symbolName}`;
                listSymbolCode.push(displayText);
            });
            setListSymbolCode(listSymbolCode);
        }

    }, []);

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQoutes = new pricingServicePb.GetLastQuotesRequest();
            symbols.forEach(item => {
                lastQoutes.addSymbolCode(item.symbolCode)
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQoutes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleTicker = (item: IAskAndBidPrice, side: number) => {
        getTicerLastQuote(item);
        handleSide(side);
    }

    const onChangeTicker = (event) => {
        const symbolCode = event.target.innerText?.split('-')[0]?.trim();
        if (symbolCode) {
            const itemTickerAdd = symbols.find(item => item.symbolCode === symbolCode);
            if (itemTickerAdd) {
                setSymbolCodeAdd(itemTickerAdd.symbolCode);
                return;
            }
        }
        setSymbolCodeAdd('');
    }

    const handleKeyUp = (value: string) => {
        const symbolCode = value?.split('-')[0]?.trim();        
        if (symbolCode) {
            const itemTickerAdd = symbols.find(item => item.symbolCode === symbolCode);
            if (itemTickerAdd) {
                setSymbolCodeAdd(itemTickerAdd.symbolCode);
                return;
            }
        }
        setSymbolCodeAdd('');
    }

    const handleKeyUp = (value: string) => {
        const symbolCode = value?.split('-')[0]?.trim();
        if (symbolCode) {
            const itemTickerAdd = symbols.find(item => item.symbolCode === symbolCode);
            if (itemTickerAdd) {
                setSymbolCodeAdd(itemTickerAdd.symbolCode);
                return;
            }
            setSymbolCodeAdd('');
            return;
        }
        setSymbolCodeAdd('');
    }

    const hendleKeyDowm = (e) => {
        if (e.key === 'Enter') {
            btnAddTicker()
        }
    }

    const btnAddTicker = () => {
        const watchLists = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
        const checkExist = watchLists.find(o => o?.symbolCode === symbolCodeAdd && o?.accountId === currentAccId);
        if (!checkExist) {
            watchLists.push({
                accountId: currentAccId,
                symbolCode: symbolCodeAdd
            });
            localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(watchLists));
            const ownWatchList = watchLists.filter(o => o?.accountId === currentAccId);
            const currentPage = Math.ceil(ownWatchList.length / pageSizeTicker);
            setCurrentPage(currentPage);
            getOrderBooks();
        }
    }

    const _renderSearchForm = () => {
        return <div className="row mb-2" onKeyDown={hendleKeyDowm}>
            <div className="col-lg-6 d-flex">
                <Autocomplete
                    onChange={onChangeTicker}
                    onKeyUp={(event: any) => handleKeyUp(event.target.value)}
                    options={listSymbolCode}
                    sx={{ width: 350 }}
                    renderInput={(params) => <TextField {...params} placeholder="Add a ticker" />}
                />

                <button type="button" className="btn btn-primary h-2r pt-3-px" disabled={symbolCodeAdd === ''} onClick={btnAddTicker}>Add</button>

            </div>
        </div>
    }

    const _renderAskPrice = (itemData: ILastQuote) => {
        let askItems: IAskAndBidPrice[] = itemData ? itemData.asksList : [];
        let arr: IAskAndBidPrice[] = [];
        let counter = MARKET_DEPTH_LENGTH - pageFirst;
        while (counter >= 0) {
            if (askItems[counter]) {
                arr.push({
                    numOrders: askItems[counter].numOrders,
                    price: askItems[counter].numOrders !== 0 ? askItems[counter].price : '-',
                    tradable: askItems[counter].numOrders !== 0 ? askItems[counter].tradable : false,
                    volume: askItems[counter].numOrders !== 0 ? askItems[counter].volume : '-',
                    symbolCode: itemData.symbolCode,
                });
            } else {
                arr.push({
                    numOrders: 0,
                    price: '-',
                    tradable: false,
                    volume: '-',
                    symbolCode: itemData.symbolCode,
                });
            }
            counter--;
        }
        return arr.map((item: IAskAndBidPrice, index: number) => (
            <tr key={index} onClick={() => handleTicker(item, tradingModel.Side.BUY)}>
                <td className="text-success d-flex justify-content-between">
                    <div>{`${item.numOrders !== 0 ? `(${item.numOrders})` : ''}`}</div>
                    <div>{item.volume !== '-' ? formatNumber(item.volume.toString()) : '-'}</div>
                </td>
                <td className="text-center">
                    {item.price !== '-' ? formatCurrency(item.price.toString()) : '-'}</td>
                <td className="w-33" >&nbsp;</td>
            </tr>
        ));
    }

    const _renderBidPrice = (itemData: ILastQuote) => {
        let bidItems: IAskAndBidPrice[] = itemData ? itemData.bidsList : [];
        let arr: IAskAndBidPrice[] = [];
        let counter = 0;
        while (counter < MARKET_DEPTH_LENGTH) {
            if (bidItems[counter]) {
                arr.push({
                    numOrders: bidItems[counter].numOrders,
                    price: bidItems[counter].numOrders !== 0 ? bidItems[counter].price : '-',
                    tradable: bidItems[counter].numOrders !== 0 ? bidItems[counter].tradable : false,
                    volume: bidItems[counter].numOrders !== 0 ? bidItems[counter].volume : '-',
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
                <td className="w-33">&nbsp;</td>
                <td className="text-center">
                    {item.price !== '-' ? formatCurrency(item.price.toString()) : '-'}</td>
                <td className="text-danger d-flex justify-content-between">
                    <div>{item.volume !== '-' ? formatNumber(item.volume.toString()) : '-'}</div>
                    <div>{`${item.numOrders !== 0 ? `(${item.numOrders})` : ''}`}</div>
                </td>
            </tr>
        ));
    }

    const getDataCurrentPage = (pageSize: number, pageCurrent: number, totalItem: ILastQuote[]) => {
        const itemPageCurrentStart = (pageCurrent - pageFirst) * pageSize;
        const itemPageCurrentEnd = pageCurrent * pageSize;
        return totalItem.slice(itemPageCurrentStart, itemPageCurrentEnd);
    }

    const removeTicker = (itemLstQuote: ILastQuote) => {
        unSubscribeQuoteEvent([itemLstQuote]);
        const currentWactchList: IWatchList[] = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
        const idx = currentWactchList.findIndex(o => o?.symbolCode === itemLstQuote?.symbolCode && o?.accountId === currentAccId);
        if (idx >= 0) {
            currentWactchList.splice(idx, 1);
        }
        localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(currentWactchList));
        const lstItem = currentWactchList.filter(o => o?.accountId === currentAccId);
        const tempLstItem = lstItem.slice((currentPage - 1) * pageSizeTicker, currentPage * pageSizeTicker - 1);
        const temps = [...pageShowCurrentLastQuote];
        const idxQuote = pageShowCurrentLastQuote?.findIndex(o => o?.symbolCode === itemLstQuote?.symbolCode);
        if (idxQuote >= 0) {
            temps.splice(idxQuote, 1)
            if (temps.length === 0) {
                setCurrentPage(currentPage - 1);
            } else {
                setPageShowCurrentLastQuote(temps);
            }
        }
    }

    const renderListDataTicker = () => (
        pageShowCurrentLastQuote.map((item: ILastQuote, index: number) => {
            return <div className="col-xl-3" key={index}>
                <table
                    className="table-item-ticker table table-sm table-hover border mb-1" key={item.symbolCode}
                >
                    <thead>
                        <tr>
                            <th colSpan={3} className="text-center">
                                <div className="position-relative">
                                    <strong className="px-4 pointer">{item?.symbolCode}</strong>
                                    <a onClick={(e) => removeTicker(item)} href="#" className="position-absolute me-1" style={{ right: 0 }} >
                                        <i className="bi bi-x-lg" />
                                    </a>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {_renderAskPrice(item)}
                        {_renderBidPrice(item)}
                    </tbody>
                </table>
    
            </div>
        })
    )

    const backPage = (currPage: number) => {
        setCurrentPage(currPage - pageFirst);
    }

    const nextPage = (currPage: number) => {
        setCurrentPage(currPage + pageFirst);
    }

    const _renderButtonBack = () => {
        return <button
            onClick={() => backPage(currentPage)}
            className="btn btn-sm btn-outline-secondary px-1 py-3">
            <i className="bi bi-chevron-double-left" />
        </button>
    }

    const _renderButtonNext = () => {
        const watchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
        const ownWatchList = watchList.filter(o => o?.accountId === currentAccId);
        const totalPage = Math.ceil(ownWatchList.length / pageSizeTicker);
        if (currentPage < totalPage) {
            return <button onClick={() => nextPage(currentPage)} className="btn btn-sm btn-outline-secondary px-1 py-3">
                <i className="bi bi-chevron-double-right" />
            </button>
        }
        return '';
    }
    const handleDisplayPaging = () => {
        const ownWatchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
        return ownWatchList.length > pageSizeTicker;
    }
    const _renderTemplateMonitoring = () => (
        <>
            {_renderSearchForm()}
            <div className="d-flex">

                <div className="col-xs-11 col-sm-11 col-md-11 col-lg-11 w-99">
                    <div className="row row-monitoring g-2">
                        {renderListDataTicker()}
                    </div>
                </div>

                {handleDisplayPaging() && <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1 mr">
                    <div>
                        {currentPage !== 1 && _renderButtonBack()}
                    </div>
                    <div>
                        {_renderButtonNext()}
                    </div>
                </div>}
            </div>

        </>
    )

    return (
        <div>{_renderTemplateMonitoring()}</div>

    )
}

ListTicker.defaultProps = defaultProps;

export default ListTicker;
