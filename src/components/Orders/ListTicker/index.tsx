import { useEffect, useState } from "react";
import { LIST_TICKER_ADDED, LIST_TICKER_INFO, MARKET_DEPTH_LENGTH, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { formatCurrency, formatNumber } from "../../../helper/utils";
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from "../../../interfaces/order.interface";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './listTicker.scss';
import * as tdpb from '../../../models/proto/trading_model_pb';
import { Autocomplete, TextField } from '@mui/material';
import { defaultTickerSearch } from "../../../mocks";
import { pageFirst, pageSizeTicker } from "../../../constants";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
interface IListTickerProps {
    getTicerLastQuote: (item: IAskAndBidPrice, curentPrice: string) => void;
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
    const [symbolList, setSymbolList] = useState<ITickerInfo[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || JSON.parse('[]')));
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [symbolIdAdd, setSymbolIdAdd] = useState<number>(0);
    const [arrLastQuoteAdd, setArrLastQuoteAdd] = useState<ILastQuote[]>(JSON.parse(localStorage.getItem(LIST_TICKER_ADDED) || JSON.parse('[]')));
    const [lstSymbolIdAdd, setLstSymbolIdAdd] = useState<number[]>([]);
    const [pageShowCurrentLastQuote, setPageShowCurrentLastQuote] = useState<ILastQuote[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                getOrderBooks();
                const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
                    setLastQoutes(resp.quotesList);
                });
            }
        });
        getOrderBooks();
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQoutes(resp.quotesList);
        });
        return () => {
            lastQuotesRes.unsubscribe();
        }
    }, []);

    useEffect(() => {
        if (arrLastQuoteAdd.length > 0) {
            let lstSymbolId: number[] = [];
            arrLastQuoteAdd.forEach(item => {
                lstSymbolId.push(Number(item.symbolCode));
            });
            setLstSymbolIdAdd(lstSymbolId);
        }
        const pageCurrent = pageFirst;
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, arrLastQuoteAdd);
        setPageShowCurrentLastQuote(dataCurrentPage);
        setCurrentPage(pageCurrent);
    }, [])

    useEffect(() => {
        const listSymbolCode: string[] = [];
        if (symbolList.length > 0) {
            symbolList.forEach((item: ITickerInfo) => {
                const displayText = `${item.ticker} - ${item.tickerName}`;
                listSymbolCode.push(displayText);
            });
            setListSymbolCode(listSymbolCode);
        }
        
    }, []);

    useEffect(() => {
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, arrLastQuoteAdd);
        setPageShowCurrentLastQuote(dataCurrentPage);
    }, [currentPage]);

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQoutes = new pricingServicePb.GetLastQuotesRequest();
            symbolList.forEach(item => {
                lastQoutes.addSymbolCode(item.symbolId.toString())
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQoutes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleTicker = (item: IAskAndBidPrice, side: string, lastQuote: ILastQuote) => {
        const itemTicker = { ...item, side: side, symbolCode: lastQuote.symbolCode };
        getTicerLastQuote(itemTicker, lastQuote.currentPrice);
    }
    const onChangeTicker = (event) => {
        const symbolCode = event.target.innerText?.split('-')[0]?.trim();
        const lstSymbolId: number[] = lstSymbolIdAdd !== [] ? lstSymbolIdAdd : [];
        if (symbolCode) {
            const itemTickerAdd = symbolList.find(item => item.ticker === symbolCode);
            if (itemTickerAdd) {
                if (lstSymbolId.length === 0 || lstSymbolId.indexOf(itemTickerAdd.symbolId) === -1) {
                    setSymbolIdAdd(itemTickerAdd.symbolId);
                    lstSymbolId.push(itemTickerAdd.symbolId);
                    setLstSymbolIdAdd(lstSymbolId);
                    return;
                }
                setSymbolIdAdd(0);
                return;
            }
            setSymbolIdAdd(0);
            return;
        }
        setSymbolIdAdd(0);
        return;
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

                <button type="button" className="btn btn-primary" onClick={btnAddTicker}>Add</button>

            </div>
        </div>
    }

    const _renderAskPrice = (itemData: ILastQuote) => {
        let askItems: IAskAndBidPrice[] = itemData.asksList;
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
            <tr key={index} onClick={() => handleTicker(item, tradingModel.OrderType.OP_BUY, itemData)}>
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
        let bidItems: IAskAndBidPrice[] = itemData.bidsList;
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
            <tr key={index} onClick={() => handleTicker(item, tradingModel.OrderType.OP_SELL, itemData)}>
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
        const listLastQuote: ILastQuote[] = arrLastQuoteAdd !== [] ? arrLastQuoteAdd : [];
        if (symbolIdAdd !== 0) {
            const itemLastQuote = lastQoutes.find(item => Number(item.symbolCode) === symbolIdAdd);
            const assignItemLastQuote: ILastQuote = itemLastQuote ? itemLastQuote : defaultTickerSearch;
            if (assignItemLastQuote !== defaultTickerSearch) {
                listLastQuote.push(assignItemLastQuote);
            }
            setArrLastQuoteAdd(listLastQuote);
            localStorage.setItem(LIST_TICKER_ADDED, JSON.stringify(listLastQuote));
        }
        const assignPageCurrent = listLastQuote.length % pageSizeTicker === 0 ? Math.trunc(listLastQuote.length / pageSizeTicker) : Math.trunc(listLastQuote.length / pageSizeTicker) + pageFirst;
        const pageCurrent = (listLastQuote.length > pageSizeTicker) ? assignPageCurrent : pageFirst;
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, arrLastQuoteAdd);
        setPageShowCurrentLastQuote(dataCurrentPage);
        setCurrentPage(pageCurrent);
    }

    const removeTicker = (itemLstQuote: ILastQuote) => {
        const itemTickerAdded = arrLastQuoteAdd.findIndex(item => item.symbolCode === itemLstQuote.symbolCode);
        let lstLastQuoteCurrent: ILastQuote[] = arrLastQuoteAdd;

        if (itemTickerAdded !== -1) {
            lstLastQuoteCurrent.splice(itemTickerAdded, pageFirst);
        }
        let lstSymbolId: number[] = [];
        lstLastQuoteCurrent.forEach(item => {
            lstSymbolId.push(Number(item.symbolCode));
        });
        setLstSymbolIdAdd(lstSymbolId);
        setArrLastQuoteAdd(lstLastQuoteCurrent);
        localStorage.setItem(LIST_TICKER_ADDED, JSON.stringify(lstLastQuoteCurrent));
        const assignPageCurrent = lstLastQuoteCurrent.length % pageSizeTicker === 0 ? Math.trunc(lstLastQuoteCurrent.length / pageSizeTicker) : Math.trunc(lstLastQuoteCurrent.length / pageSizeTicker) + pageFirst;
        const pageCurrent = (lstLastQuoteCurrent.length > pageSizeTicker) ? assignPageCurrent : pageFirst;
        const dataCurrentPage = getDataCurrentPage(pageSizeTicker, currentPage, arrLastQuoteAdd);
        setPageShowCurrentLastQuote(dataCurrentPage);
        setCurrentPage(pageCurrent);
    }

    const renderListDataTicker = pageShowCurrentLastQuote.map((item: ILastQuote, index: number) => {
        const symbol = symbolList.find((o: ITickerInfo) => o.symbolId.toString() === item.symbolCode);
        return <div className="col-xl-3" key={index}>
            <table
                className="table-item-ticker table table-sm table-hover border mb-1" key={item.symbolCode}
            >
                <thead>
                    <tr>
                        <th colSpan={3} className="text-center">
                            <div className="position-relative">
                                <strong className="px-4 pointer">{symbol?.ticker}</strong>
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

    const _renderButtonBack = () => (
        currentPage > pageFirst && <button
            onClick={() => backPage(currentPage)}
            className="btn btn-sm btn-outline-secondary px-1 py-3">
            <i className="bi bi-chevron-double-left" />
        </button>
    )

    const _renderButtonNext = () => (
        (currentPage !== Math.trunc(arrLastQuoteAdd.length / pageSizeTicker) + pageFirst && (arrLastQuoteAdd.length > 0)) && Math.trunc(arrLastQuoteAdd.length % pageSizeTicker) !== 0 &&
        <button onClick={() => nextPage(currentPage)} className="btn btn-sm btn-outline-secondary px-1 py-3">
            <i className="bi bi-chevron-double-right" />
        </button>
    )
    const _conditionStyle = () => {
        const conditionBack = currentPage > pageFirst;
        const conditionNext = currentPage !== Math.trunc(arrLastQuoteAdd.length / pageSizeTicker) + pageFirst && arrLastQuoteAdd.length > 0;
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
                        {_renderButtonNext()}
                    </div>
                    <div>
                        {_renderButtonBack()}
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