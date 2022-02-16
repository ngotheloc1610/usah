import { useEffect, useState } from "react";
import { CURRENT_CHOOSE_TICKER, MARKET_DEPTH_LENGTH, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { formatCurrency, formatNumber } from "../../../helper/utils";
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from "../../../interfaces/order.interface";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './listTicker.scss';
import * as tdpb from '../../../models/proto/trading_model_pb';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ISymbolList } from "../../../interfaces/ticker.interface";
import { Autocomplete, TextField } from '@mui/material';
import { defaultTicker, defaultTickerSearch } from "../../../mocks";
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
    const { msgSuccess } = props;
    const { getTicerLastQuote } = props;
    const [lastQoutes, setLastQoutes] = useState(dafaultLastQuotesData);
    const tradingModel: any = tdpb;
    const [symbolList, setSymbolList] = useState<ITickerInfo[]>(JSON.parse(localStorage.getItem(CURRENT_CHOOSE_TICKER) || '{}'));
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [symbolIdAdd, setSymbolIdAdd] = useState<number>(0);
    const [arrLastQuoteAdd, setArrLastQuoteAdd] = useState<ILastQuote[]>([]);
    const [lstSymbolIdAdd, setLstSymbolIdAdd] = useState<number[]>([]);
    const [pageShowCurrentLastQuote, setPageShowCurrentLastQuote] = useState<ILastQuote[]>([]);

    // useEffect(() => mapArrayDashboardList(), [lastQoutes])

    // const mapArrayDashboardList = () => {

    //     const getItemSymbolData = (symbolCode: string) => {
    //         return lastQoutes.find(lastQuotesItem => lastQuotesItem.symbolCode === symbolCode);
    //     }

    //     let listData: ITickerInfo[] = [];

    //     let itemData: ITickerInfo = {
    //         symbolId: 0,
    //         tickerName: '',
    //         ticker: '',
    //         stockPrice: '',
    //         previousClose: '',
    //         open: '',
    //         high: '',
    //         low: '',
    //         lastPrice: '',
    //         volume: '',
    //         change: '',
    //         changePrecent: '',
    //         side: '',
    //     };
    //     symbolList.forEach(item => {
    //         const itemSymbolData = getItemSymbolData(item.symbolId.toString());
    //         itemData = {
    //             tickerName: item.symbolName,
    //             symbolId: item.symbolId,
    //             ticker: item.symbolCode,
    //             previousClose: itemSymbolData?.close,
    //             open: itemSymbolData?.open,
    //             high: itemSymbolData?.high,
    //             low: itemSymbolData?.low,
    //             lastPrice: (itemSymbolData && itemSymbolData.currentPrice) ? itemSymbolData?.currentPrice : '',
    //             volume: (itemSymbolData && itemSymbolData.volumePerDay) ? itemSymbolData?.volumePerDay : '',
    //             change: calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open).toString(),
    //             changePrecent: ((calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open) / Number(getItemSymbolData(item.symbolId.toString())?.open)) * 100).toString(),
    //         }
    //         listData.push(itemData);
    //     });
    //     sethandleSymbolList(listData);
    // }

    useEffect(() => {
        getOrderBooks();
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQoutes(resp.quotesList);
        });
        return () => {
            lastQuotesRes.unsubscribe();
        }
    });

    useEffect(() => {
        const listSymbolCode: string[] = [];
        symbolList.forEach((item: ITickerInfo) => {
            const displayText = `${item.ticker} - ${item.tickerName}`;
            listSymbolCode.push(displayText);
        });
        setListSymbolCode(listSymbolCode);
    }, [])

    // useEffect(() => {
    //     console.log(90, symbolList);
    //     const ws = wsService.getSocketSubject().subscribe(resp => {
    //         if (resp === SOCKET_CONNECTED) {
    //             sendMsgSymbolList();
    //         }
    //     });

    //     const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
    //         setSymbolList(res.symbolList)
    //     });

    //     return () => {
    //         ws.unsubscribe();
    //         renderDataSymbolList.unsubscribe();
    //     }
    // }, [])

    // useEffect(() => {
    //     sendMsgSymbolList();
    //     const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
    //         setSymbolList(res.symbolList)
    //     });

    //     return () => {
    //         renderDataSymbolList.unsubscribe();
    //     }
    // }, [msgSuccess]);

    // const calculateChange = (lastPrice?: string, open?: string) => {
    //     if (!lastPrice && !open) {
    //         return 0;
    //     }
    //     if (!lastPrice) {
    //         return Number(open);
    //     }
    //     if (!open) {
    //         return Number(lastPrice);
    //     }
    //     return Number(lastPrice) - Number(open)
    // }

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

    // const handleItemSearch = (itemValue: string) => {
    //     setItemSearch(itemValue);
    // }

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
            }
            return;
        }
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
        let counter = MARKET_DEPTH_LENGTH - 1;
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

    const handleLastQuote = () => {
        const listLastQuote: ILastQuote[] = arrLastQuoteAdd !== [] ? arrLastQuoteAdd : [];
        if (symbolIdAdd !== 0) {
            const itemLastQuote = lastQoutes.find(item => Number(item.symbolCode) === symbolIdAdd);
            const assignItemLastQuote: ILastQuote = itemLastQuote ? itemLastQuote : defaultTickerSearch;
            listLastQuote.push(assignItemLastQuote);
            setArrLastQuoteAdd(listLastQuote);
        }
        if (listLastQuote.length <= 12) {
            setPageShowCurrentLastQuote(listLastQuote);
            return;
        } if (listLastQuote.length > 12 && listLastQuote.length <= 24) {
            setPageShowCurrentLastQuote(listLastQuote.slice(12, listLastQuote.length));
            return;
        }
        setPageShowCurrentLastQuote(listLastQuote.slice(24, listLastQuote.length));
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
                                <a href="#" className="position-absolute me-1" style={{ right: 0 }} >
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

    const _renderTemplateMonitoring = () => (
        <div>
            {_renderSearchForm()}
            <div className="row row-monitoring g-2">
                {renderListDataTicker}
            </div>
        </div>
    )

    return (
        <div>{_renderTemplateMonitoring()}</div>

    )
}

ListTicker.defaultProps = defaultProps;

export default ListTicker;