import { useEffect, useState } from "react";
import { LIST_PRICE_TYPE, LIST_TICKER_INFO, LIST_WATCHING_TICKERS, MARKET_DEPTH_LENGTH, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { assignListPrice, formatCurrency, formatNumber } from "../../../helper/utils";
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from "../../../interfaces/order.interface";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './listTicker.scss';
import * as tdpb from '../../../models/proto/trading_model_pb';
import * as psbp from "../../../models/proto/pricing_service_pb";
import { Autocomplete, TextField } from '@mui/material';
import { DEFAULT_DATA_TICKER } from "../../../mocks";
import { pageFirst, pageSizeTicker } from "../../../constants";
import { IQuoteEvent } from "../../../interfaces/quotes.interface";
import { ISymbolList } from "../../../interfaces/ticker.interface";
interface IListTickerProps {
    getTicerLastQuote: (item: IAskAndBidPrice) => void;
    msgSuccess?: string;
    symbolName: string[];
}

const defaultProps = {
    getTicerLastQuote: null
}

const dafaultLastQuotesData: ILastQuote[] = [];

const ListTicker = (props: IListTickerProps) => {
    const { getTicerLastQuote, msgSuccess } = props;
    const [lastQoutes, setLastQoutes] = useState(dafaultLastQuotesData);
    const tradingModel: any = tdpb;
    const [symbolList, setSymbolList] = useState<ISymbolList[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]'));
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [symbolIdAdd, setSymbolIdAdd] = useState<number>(0);
    const [lstWatchingTickers, setLstWatchingTickers] = useState<ILastQuote[]>(JSON.parse(localStorage.getItem(LIST_WATCHING_TICKERS) || '[]'));
    const [lstSymbolIdAdd, setLstSymbolIdAdd] = useState<number[]>([]);
    const [pageShowCurrentLastQuote, setPageShowCurrentLastQuote] = useState<ILastQuote[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(pageFirst);
    const [quoteEvent, setQuoteEvent] = useState([]);
    const [listSymbol, setListSymbol] = useState<string[]>([]);

    const [symbolCodeAdd, setSymbolCodeAdd] = useState<string>('');
    const [lstSymbolCodeAdd, setLstSymbolCodeAdd] = useState<string[]>([]);

    useEffect(() => {
        const listSymbol: string[] = []
        pageShowCurrentLastQuote.map(item => {
            listSymbol.push(item.symbolCode)
        })
        setListSymbol(listSymbol)
    }, [pageShowCurrentLastQuote])

    useEffect(() => {

        const subscribeQuoteRes = wsService.getSubscribeQuoteSubject().subscribe(resp => {
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        return () => {
            unSubscribeQuoteEvent(lstWatchingTickers);
            subscribeQuoteRes.unsubscribe();
            quoteEvent.unsubscribe();
        }
    }, []);

    useEffect(() => {    
        subscribeQuoteEvent(lstWatchingTickers);
    }, [lstWatchingTickers]);

    useEffect(() => {
        processQuote(quoteEvent);
    }, [quoteEvent]);

    const processQuote = (quotes: IQuoteEvent[]) => {
        const tmpList = [...pageShowCurrentLastQuote];
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
            });
            
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

        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                getOrderBooks();
            }
        });

        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQoutes(resp.quotesList);
        });

        return () => {
            ws.unsubscribe();
            lastQuotesRes.unsubscribe();
        }
    }, []);

    useEffect(() => {
        getOrderBooks();
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQoutes(resp.quotesList);
            const lstLastQuote = resp.quotesList;
            const listWatchingTickersCode: string[] = [];
            const lstArrLastQuote: ILastQuote[] = [];
            if (lstWatchingTickers.length > 0 && lstLastQuote.length > 0) {
                lstWatchingTickers.forEach(item => listWatchingTickersCode.push(item.symbolCode));
                listWatchingTickersCode.forEach(itemLastQuoteId => {
                    const itemLastQuote = lstLastQuote.find(item => item.symbolCode === itemLastQuoteId);
                    if (itemLastQuote) {
                        lstArrLastQuote.push(itemLastQuote);
                    }
                });
                setLstWatchingTickers(lstArrLastQuote);
                localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(lstArrLastQuote));
            }
        });
        return () => {
            lastQuotesRes.unsubscribe();
        }
    }, [symbolList]);

    useEffect(() => {
        if (lstWatchingTickers.length > 0) {
            let lstSymbolId: number[] = [];
            lstWatchingTickers.forEach(item => {
                lstSymbolId.push(Number(item.symbolCode));
            });
            setLstSymbolIdAdd(lstSymbolId);
        }
        if (!msgSuccess) {
            setCurrentPage(pageFirst)
        }
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, lstWatchingTickers);
        setPageShowCurrentLastQuote(dataCurrentPage);
    }, [lstWatchingTickers])

    useEffect(() => {
        const listSymbolCode: string[] = [];
        console.log(188, symbolList);
        if (symbolList.length > 0) {
            symbolList.forEach((item: ISymbolList) => {
                const displayText = `${item.symbolCode} - ${item.symbolName}`;
                listSymbolCode.push(displayText);
            });
            setListSymbolCode(listSymbolCode);
        }

    }, []);

    useEffect(() => {
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, lstWatchingTickers);
        setPageShowCurrentLastQuote(dataCurrentPage);
    }, [currentPage]);

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQoutes = new pricingServicePb.GetLastQuotesRequest();
            symbolList.forEach(item => {
                lastQoutes.addSymbolCode(item.symbolCode)
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQoutes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleTicker = (item: IAskAndBidPrice, side: string, lastQuote: ILastQuote) => {
        const itemTicker = { ...item, side: side, symbolCode: lastQuote.symbolCode };
        getTicerLastQuote(itemTicker);
    }

    const onChangeTicker = (event) => {
        const symbolCode = event.target.innerText?.split('-')[0]?.trim();
        if (symbolCode) {
            const itemTickerAdd = symbolList.find(item => item.symbolCode === symbolCode);
            if (itemTickerAdd) {
                setSymbolCodeAdd(itemTickerAdd.symbolCode);
                return;
            }
            setSymbolCodeAdd('');
            return;
        }
    }

    const btnAddTicker = () => {
        handleLastQuote();
    }

    const _renderSearchForm = () => {
        return <div className="row mb-2">
            <div className="col-lg-6 d-flex">
                <Autocomplete
                    onChange={onChangeTicker}
                    options={listSymbolCode}
                    sx={{ width: 350 }}
                    renderInput={(params) => <TextField {...params} placeholder="Add a ticker" />}
                />

                <button type="button" className="btn btn-primary h-2r pt-3-px" onClick={btnAddTicker}>Add</button>

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
                    symbolCode: askItems[counter].numOrders !== 0 ? itemData.symbolCode : '-',
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
            <tr key={index} onClick={() => handleTicker(item, tradingModel.Side.BUY, itemData)}>
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
                    symbolCode: bidItems[counter].numOrders !== 0 ? itemData.symbolCode : '-'
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
            <tr key={index} onClick={() => handleTicker(item, tradingModel.Side.SELL, itemData)}>
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

    const handleLastQuote = () => {

        const lstSymbolCode: string[] = lstSymbolCodeAdd.length > 0 ? lstSymbolCodeAdd : [];
        if (lstSymbolCode.length === 0 || lstSymbolCode.indexOf(symbolCodeAdd) === -1) {
            lstSymbolCode.push(symbolCodeAdd);
            setLstSymbolCodeAdd(lstSymbolCode);
            const newItem = lastQoutes.find(item => item.symbolCode === symbolCodeAdd);
            newItem && subscribeQuoteEvent([newItem])
        } else {
            return;
        }
        handleAddTicker();
    }

    const handleAddTicker = () => {
        const listLastQuote: ILastQuote[] = lstWatchingTickers.length > 0 ? lstWatchingTickers : [];
        if (symbolCodeAdd !== '') {
            const itemLastQuote = lastQoutes.find(item => item.symbolCode === symbolCodeAdd);            
            const assignItemLastQuote: ILastQuote = itemLastQuote ? itemLastQuote : DEFAULT_DATA_TICKER;
            if (assignItemLastQuote !== DEFAULT_DATA_TICKER) {
                listLastQuote.push(assignItemLastQuote);
            }
            setLstWatchingTickers(listLastQuote);
            localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(listLastQuote));
        }
        const assignPageCurrent = listLastQuote.length % pageSizeTicker === 0 ? Math.trunc(listLastQuote.length / pageSizeTicker) : Math.trunc(listLastQuote.length / pageSizeTicker) + pageFirst;
        const pageCurrent = (listLastQuote.length > pageSizeTicker) ? assignPageCurrent : pageFirst;
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, lstWatchingTickers);
        setPageShowCurrentLastQuote(dataCurrentPage);
        setCurrentPage(pageCurrent);
    }

    const removeTicker = (itemLstQuote: ILastQuote) => {
        unSubscribeQuoteEvent([itemLstQuote]);
        const itemTickerAdded = lstWatchingTickers.findIndex(item => item.symbolCode === itemLstQuote.symbolCode);
        let lstLastQuoteCurrent: ILastQuote[] = lstWatchingTickers;

        if (itemTickerAdded !== -1) {
            lstLastQuoteCurrent.splice(itemTickerAdded, pageFirst);
        }
        let lstSymbolId: number[] = [];
        lstLastQuoteCurrent.forEach(item => {
            lstSymbolId.push(Number(item.symbolCode));
        });
        setLstSymbolIdAdd(lstSymbolId);
        setLstWatchingTickers(lstLastQuoteCurrent);
        localStorage.setItem(LIST_WATCHING_TICKERS, JSON.stringify(lstLastQuoteCurrent));
        const assignPageCurrent = lstLastQuoteCurrent.length % pageSizeTicker === 0 ? Math.trunc(lstLastQuoteCurrent.length / pageSizeTicker) : Math.trunc(lstLastQuoteCurrent.length / pageSizeTicker) + pageFirst;
        const pageCurrent = (lstLastQuoteCurrent.length > pageSizeTicker) ? assignPageCurrent : pageFirst;
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, lstWatchingTickers);
        setPageShowCurrentLastQuote(dataCurrentPage);
        setCurrentPage(pageCurrent);
    }

    const renderListDataTicker = pageShowCurrentLastQuote.map((item: ILastQuote, index: number) => {
        // const symbol = symbolList.find((o: ITickerInfo) => o.symbolId.toString() === item.symbolCode);
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

    const backPage = (currPage: number) => {
        setCurrentPage(currPage - pageFirst);
    }

    const nextPage = (currPage: number) => {
        setCurrentPage(currPage + pageFirst);
    }

    const _renderButtonBack = () => {
        const divideOfListWatchingPageSize = Math.trunc(lstWatchingTickers.length / pageSizeTicker);
        const totalPage = Math.trunc(lstWatchingTickers.length % pageSizeTicker) !== 0 ? divideOfListWatchingPageSize + pageFirst : divideOfListWatchingPageSize;
        const conditionChevronDoubleLeft = (totalPage >= currentPage && currentPage > pageFirst)
        return (conditionChevronDoubleLeft) && <button
            onClick={() => backPage(currentPage)}
            className="btn btn-sm btn-outline-secondary px-1 py-3">
            <i className="bi bi-chevron-double-left" />
        </button>
    }

    const _renderButtonNext = () => {
        const divideOfListWatchingPageSize = Math.trunc(lstWatchingTickers.length / pageSizeTicker);
        const totalPage = Math.trunc(lstWatchingTickers.length % pageSizeTicker) !== 0 ? divideOfListWatchingPageSize + pageFirst : divideOfListWatchingPageSize;
        const conditionChevronDoubleRight = currentPage < totalPage;
        return conditionChevronDoubleRight && <button onClick={() => nextPage(currentPage)} className="btn btn-sm btn-outline-secondary px-1 py-3">
            <i className="bi bi-chevron-double-right" />
        </button>
    }
    const _conditionStyle = () => {
        const conditionBack = currentPage > pageFirst;
        const conditionNext = currentPage !== Math.trunc(lstWatchingTickers.length / pageSizeTicker) + pageFirst && lstWatchingTickers.length > 0;
        return (conditionBack || conditionNext);
    }
    const _renderTemplateMonitoring = () => (
        <>
            {_renderSearchForm()}
            <div className={`${_conditionStyle() ? "d-flex" : ""}`}>

                <div className="col-xs-11 col-sm-11 col-md-11 col-lg-11 w-99">
                    <div className="row row-monitoring g-2">
                        {renderListDataTicker}
                    </div>
                </div>

                <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1 mr">
                    <div>
                        {_renderButtonBack()}
                    </div>
                    <div>
                        {_renderButtonNext()}
                    </div>
                </div>
            </div>

        </>
    )

    return (
        <div>{_renderTemplateMonitoring()}</div>

    )
}

ListTicker.defaultProps = defaultProps;

export default ListTicker;
