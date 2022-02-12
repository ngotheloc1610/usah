import { useEffect, useState } from "react";
import { CURRENT_CHOOSE_TICKER, MARKET_DEPTH_LENGTH } from "../../../constants/general.constant";
import { formatCurrency, formatNumber, getSymbolId } from "../../../helper/utils";
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from "../../../interfaces/order.interface";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './listTicker.scss';
import * as tdpb from '../../../models/proto/trading_model_pb';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ISymbolList } from "../../../interfaces/ticker.interface";
interface IListTickerProps {
    getTicerLastQuote: (item: IAskAndBidPrice, curentPrice: string) => void;
    symbolName: string[];
    symbolList: ISymbolList[];
}

const defaultProps = {
    getTicerLastQuote: null
}

const dafaultLastQuotesData: ILastQuote[] = [];

const ListTicker = (props: IListTickerProps) => {
    const { getTicerLastQuote, symbolName, symbolList } = props;
    const [ticker, setTicker] = useState<string | undefined>('')
    const [itemSearch, setItemSearch] = useState<string | undefined>('');
    const [lastQoutes, setLastQoutes] = useState(dafaultLastQuotesData);
    const tradingModel: any = tdpb;

    useEffect(() => {
        getOrderBooks();
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQoutes(resp.quotesList);
        });

        return () => {
            lastQuotesRes.unsubscribe();
        }
    }, [symbolList]);

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

    const handleItemSearch = () => {
        setItemSearch(ticker);
    }

    const handleTicker = (item: IAskAndBidPrice, side: string, lastQuote: ILastQuote) => {
        const itemTicker = { ...item, side: side, symbolCode: lastQuote.symbolCode };
        getTicerLastQuote(itemTicker, lastQuote.currentPrice);
    }

    const handleChangeTicker = (event: any) => {
        const string = event.target.innerText
        if (string !== undefined) {
            setTicker(getSymbolId(string, symbolList))
        } else {
            setTicker('0')
        }
    }

    const handleKeyUp = (event: any) => {
        const string = event.target.value
        if (string !== undefined) {
            setTicker(getSymbolId(string, symbolList))
        } else {
            setTicker('0')
        }
    }

    const _renderSearchForm = () => (
        <div className="row mb-2">
            <div className="col-lg-6">
                <div className="search-order-monitoring">
                    <Autocomplete
                        onChange={handleChangeTicker}
                        onKeyUp={handleKeyUp}
                        sx={{ width: 400 }}
                        disablePortal
                        options={symbolName}
                        renderInput={(params) => <TextField {...params} placeholder="Add a ticker" />}
                    />
                    <button className="btn btn-primary ms-1 pad-top" onClick={handleItemSearch}>Add</button>
                </div>
            </div>
        </div>
    )

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
        const defaultBidPrice: IAskAndBidPrice = {
            numOrders: 0,
            price: '-',
            tradable: false,
            volume: '-',
            symbolCode: '-'
        }
        return arr.map((item: IAskAndBidPrice, index: number) => (
            <tr key={index} onClick={() => handleTicker(item, tradingModel.OrderType.OP_SELL, itemData)}>
                <td className="w-33">&nbsp;</td>
                <td className="text-center">
                    {item.price !== '-' ? formatCurrency(item.price.toString()) : '-'}</td>
                <td className="text-danger d-flex justify-content-between">
                    <div>{`${item.numOrders !== 0 ? `(${item.numOrders})` : ''}`}</div>
                    <div>{item.volume !== '-' ? formatNumber(item.volume.toString()) : '-'}</div>
                </td>
            </tr>
        ));
    }

    const getLastQouteDisplay = () => {
        const tickerDetail = JSON.parse(localStorage.getItem(CURRENT_CHOOSE_TICKER) || '{}')
        const listArr: ITickerInfo[] = [];
        let counter = 0;
        tickerDetail.forEach(item => {
            if (counter < 12) {
                listArr.push(item);
                counter++;
            }
        });
        const output: ILastQuote[] = [];
        listArr.forEach(element => {
            const obj: ILastQuote = {
                asksList: [],
                bidsList: [],
                close: element.previousClose,
                currentPrice: element.lastPrice,
                high: element.high,
                low: element.low,
                netChange: element.change,
                open: element.open,
                pctChange: element.changePrecent,
                quoteTime: 0,
                scale: 0,
                symbolCode: element.symbolId.toString(),
                symbolId: Number(element.symbolId),
                tickPerDay: 0,
                volumePerDay: '0'
            };
            output.push(obj);
        })
        lastQoutes.forEach((o: ILastQuote) => {
            const index = output.findIndex(e => e.symbolCode === o.symbolCode);
            if (index >= 0) {
                output[index] = o;
            }
        })

        return output;
    }

    const renderListDataTicker = getLastQouteDisplay().map((item: ILastQuote, index: number) => {
        const symbol = symbolList.find((o: ISymbolList) => o.symbolId.toString() === item.symbolCode);
        return <div className="col-xl-3" key={index}>
            <table
                className="table-item-ticker table table-sm table-hover border mb-1" key={item.symbolCode}
            >
                <thead>
                    <tr>
                        <th colSpan={3} className="text-center">
                            <div className="position-relative">
                                <strong className="px-4 pointer">{symbol?.symbolCode}</strong>
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