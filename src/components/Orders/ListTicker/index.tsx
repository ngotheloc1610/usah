import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Autocomplete, TextField } from '@mui/material';

import { wsService } from "../../../services/websocket-service";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import * as tdpb from '../../../models/proto/trading_model_pb';
import * as psbp from "../../../models/proto/pricing_service_pb";

import { ACCOUNT_ID, LIST_TICKER_INFO, LIST_WATCHING_TICKERS, MARKET_DEPTH_LENGTH, MESSAGE_TOAST, SOCKET_CONNECTED, SOCKET_RECONNECTED } from "../../../constants/general.constant";
import { formatCurrency, formatNumber } from "../../../helper/utils";
import { IAskAndBidPrice, ILastQuote, IListOrderMonitoring, ISymbolInfo, IWatchList } from "../../../interfaces/order.interface";
import { pageFirst, pageSizeTicker } from "../../../constants";
import { IQuoteEvent } from "../../../interfaces/quotes.interface";
import { DEFAULT_DATA_TICKER } from "../../../mocks";

import './listTicker.scss';
interface IListTickerProps {
    getTicerLastQuote: (item: IAskAndBidPrice) => void;
    handleSide: (side: number) => void;
    msgSuccess?: string;
    getSymbolCodeRemove: (item: string) => void;
}

const defaultProps = {
    getTicerLastQuote: null
}

const dafaultLastQuotesData: ILastQuote[] = [];

const ListTicker = (props: IListTickerProps) => {
    const { getTicerLastQuote, handleSide, getSymbolCodeRemove } = props;
    const [lastQuotes, setLastQuotes] = useState(dafaultLastQuotesData);
    const tradingModel: any = tdpb;
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [pageShowCurrentLastQuote, setPageShowCurrentLastQuote] = useState<ILastQuote[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(pageFirst);
    const [quoteEvent, setQuoteEvent] = useState([]);
    const [symbolCodeAdd, setSymbolCodeAdd] = useState<string>('');
    const [orderList, setOrderList] = useState<IListOrderMonitoring[]>([]);

    const [isDeleteTicker, setIsDeleteTicker] = useState(false);

    const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const currentAccId = sessionStorage.getItem(ACCOUNT_ID);
    const watchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
    const ownWatchList = watchList.filter(o => o?.accountId === currentAccId);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED || resp === SOCKET_RECONNECTED) {
                getOrderBooks(ownWatchList);
                subscribeQuoteEvent(ownWatchList);
            }
        });

        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQuotes(resp.quotesList);
        });

        const listOrder = wsService.getListOrder().subscribe(response => {
            setOrderList(response.orderList);
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        return () => {
            unSubscribeQuoteEvent(ownWatchList);
            quoteEvent.unsubscribe();
            ws.unsubscribe();
            lastQuotesRes.unsubscribe();
            listOrder.unsubscribe();
        }
    }, []);

    useEffect(() => {
        processQuote(quoteEvent);
    }, [quoteEvent]);

    useEffect(() => {
        processLastQuote(lastQuotes)
    }, [lastQuotes, currentPage])

    useEffect(() => {
        const quotesDefault: ILastQuote[] = [];
        ownWatchList.forEach(item => {
            if (item) {
                const lastQuoteDefault: ILastQuote = {
                    ...DEFAULT_DATA_TICKER,
                    symbolCode: item.symbolCode,
                }
                quotesDefault.push(lastQuoteDefault);
            }
        });
        const temp = getDataCurrentPage(pageSizeTicker, currentPage, quotesDefault);
        temp.slice((currentPage - 1) * pageSizeTicker, currentPage * pageSizeTicker - 1);
        setPageShowCurrentLastQuote(temp);
    }, [])

    const processLastQuote = (lastQuotes: ILastQuote[]) => {
        const quotes: ILastQuote[] = [];
        ownWatchList.forEach(item => {
            if (item) {
                const idxQuote = lastQuotes.findIndex(e => e?.symbolCode === item?.symbolCode);
                if (idxQuote >= 0) {
                    quotes.push(lastQuotes[idxQuote]);
                }
            }
        });
        let temp = getDataCurrentPage(pageSizeTicker, currentPage, quotes);
        if (temp.length === 0 && currentPage > 1 && isDeleteTicker) {
            setIsDeleteTicker(false)
            setCurrentPage(currentPage - 1);
            temp = getDataCurrentPage(pageSizeTicker, currentPage - 1, quotes);
        }
        setPageShowCurrentLastQuote(temp);
    }

    const processQuote = (quotes: IQuoteEvent[]) => {
        const tmpList = [...pageShowCurrentLastQuote];
        const tempLastQuote = [...lastQuotes];
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
            setPageShowCurrentLastQuote(tmpList);
        }
    }

    const subscribeQuoteEvent = (ownWatchList: any[]) => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            ownWatchList.forEach(item => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolCode);
            })
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const unSubscribeQuoteEvent = (ownWatchList: any[]) => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            ownWatchList.forEach(item => {
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

    const getOrderBooks = (ownWatchList: any) => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQuotes = new pricingServicePb.GetLastQuotesRequest();
            ownWatchList.forEach(item => {
                lastQuotes.addSymbolCode(item.symbolCode)
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleTicker = (item: IAskAndBidPrice, side: number) => {
        getTicerLastQuote(item);
        handleSide(side);
    }

    const onChangeTicker = (event) => {
        if (event.key !== 'Enter') {
            const symbolCode = event.target.innerText?.split('-')[0]?.trim();
            if (symbolCode) {
                const itemTickerAdd = symbols.find(item => item.symbolCode === symbolCode.toUpperCase());
                if (itemTickerAdd) {
                    setSymbolCodeAdd(itemTickerAdd.symbolCode);
                    return;
                }
            }
            setSymbolCodeAdd('');
        }
    }

    const handleKeyUp = (e: any) => {
        if (e.key === 'Enter') {
            const symbolCode = e.target.value?.split('-')[0]?.trim();
            if (symbolCode) {
                const itemTickerAdd = symbols.find(item => item.symbolCode === symbolCode.toUpperCase());
                if (itemTickerAdd) {
                    setSymbolCodeAdd(itemTickerAdd.symbolCode);
                    btnAddTicker(itemTickerAdd.symbolCode);
                    return;
                }
            }
            btnAddTicker('');
            setSymbolCodeAdd('');
        }

    }

    const _rendetMessageSuccess = () => (
        <div>{toast.success(MESSAGE_TOAST.SUCCESS_ADD)}</div>
    )

    const _renderMessageExist = () => (
        <div>{toast.error(MESSAGE_TOAST.EXIST_ADD)}</div>
    )

    const _renderMessageError = () => (
        <div>{toast.error(MESSAGE_TOAST.ERROR_ADD)}</div>
    )

    const btnAddTicker = (symbolCodeAdd) => {
        if (symbolCodeAdd) {
            const currentWactchList = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
            const checkExist = currentWactchList.find(o => o?.symbolCode === symbolCodeAdd && o?.accountId === currentAccId);
            if (!checkExist) {
                const tempWatchList = {
                    accountId: currentAccId,
                    symbolCode: symbolCodeAdd
                };
                currentWactchList.push(tempWatchList);
                subscribeQuoteEvent([tempWatchList]);
                localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(currentWactchList));
                const ownWatchList = currentWactchList.filter(o => o?.accountId === currentAccId);
                const currentPage = Math.ceil(ownWatchList.length / pageSizeTicker);
                setCurrentPage(currentPage);

                const quotesDefault: ILastQuote[] = [];
                ownWatchList.forEach((item, index) => {
                    if (item) {
                        const lastQuoteDefault: ILastQuote = {
                            asksList: pageShowCurrentLastQuote[index]?.asksList || [],
                            bidsList: pageShowCurrentLastQuote[index]?.bidsList || [],
                            close: pageShowCurrentLastQuote[index]?.close || '',
                            currentPrice: pageShowCurrentLastQuote[index]?.currentPrice || '',
                            high: pageShowCurrentLastQuote[index]?.high || '',
                            low: pageShowCurrentLastQuote[index]?.low || '',
                            netChange: pageShowCurrentLastQuote[index]?.netChange || '',
                            open: pageShowCurrentLastQuote[index]?.open || '',
                            pctChange: pageShowCurrentLastQuote[index]?.pctChange || '',
                            quoteTime: pageShowCurrentLastQuote[index]?.quoteTime || 0,
                            scale: pageShowCurrentLastQuote[index]?.scale || 0,
                            symbolCode: pageShowCurrentLastQuote[index]?.symbolCode || item.symbolCode,
                            symbolId: pageShowCurrentLastQuote[index]?.symbolId || 0,
                            tickPerDay: pageShowCurrentLastQuote[index]?.tickPerDay || 0,
                            volumePerDay: pageShowCurrentLastQuote[index]?.volumePerDay || '',
                            volume: pageShowCurrentLastQuote[index]?.volume || ''
                        }
                        quotesDefault.push(lastQuoteDefault);
                    }
                });
                const temp = getDataCurrentPage(pageSizeTicker, currentPage, quotesDefault);
                temp.slice((currentPage - 1) * pageSizeTicker, currentPage * pageSizeTicker - 1);
                setPageShowCurrentLastQuote(temp);

                getOrderBooks(ownWatchList);
                _rendetMessageSuccess();

            } else {
                _renderMessageExist();
            }
        } else {
            _renderMessageError();
        }
    }

    const _renderSearchForm = useMemo(() => {
        return <div className="row mb-2">
            <div className="col-lg-6 d-flex">
                <form onSubmit={(e) => {e.preventDefault();}}>
                    <Autocomplete
                        onChange={onChangeTicker}
                        onKeyUp={handleKeyUp}
                        options={listSymbolCode}
                        sx={{ width: 350 }}
                        renderInput={(params) => <TextField {...params} placeholder="Add a ticker" />}
                    />
                </form>
                <button type="button" className="btn btn-primary h-2r pt-3-px" disabled={symbolCodeAdd === ''} onClick={() => btnAddTicker(symbolCodeAdd)} >Add</button>
            </div>
        </div>
    }, [listSymbolCode, symbolCodeAdd])

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
                    {/* <div>{`${item.numOrders !== 0 ? `(${item.numOrders})` : ''}`}</div> */}
                    <div></div>
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
                    <div></div>
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
        const index = orderList.findIndex(o => o?.symbolCode === itemLstQuote?.symbolCode);
        if (index < 0) {
            unSubscribeQuoteEvent([itemLstQuote]);
        }
        getSymbolCodeRemove(itemLstQuote.symbolCode);
        const currentWactchList: IWatchList[] = JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]');
        const idx = currentWactchList.findIndex(o => o?.symbolCode === itemLstQuote?.symbolCode && o?.accountId === currentAccId);
        if (idx >= 0) {
            currentWactchList.splice(idx, 1);
        }
        localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(currentWactchList));
        const idxQuote = ownWatchList?.findIndex(o => o?.symbolCode === itemLstQuote?.symbolCode);
        if (idxQuote >= 0) {
            setIsDeleteTicker(true);
            ownWatchList.splice(idxQuote, 1);
            getOrderBooks(ownWatchList);
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
        getOrderBooks(ownWatchList);
    }

    const nextPage = (currPage: number) => {
        setCurrentPage(currPage + pageFirst);
        getOrderBooks(ownWatchList);
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
            {_renderSearchForm}
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
