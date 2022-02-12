import { useEffect, useState } from "react";
import { MARKET_DEPTH_LENGTH, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { formatCurrency, formatNumber } from "../../../helper/utils";
import { IAskAndBidPrice, ILastQuote, ITickerInfo } from "../../../interfaces/order.interface";
import { LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './listTicker.scss';
import * as tdpb from '../../../models/proto/trading_model_pb';
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import { ISymbolList } from "../../../interfaces/ticker.interface";
interface IListTickerProps {
    getTicerLastQuote: (item: IAskAndBidPrice, curentPrice: string) => void;
}

const defaultProps = {
    getTicerLastQuote: null
}

const dafaultLastQuotesData: ILastQuote[] = [];

const ListTicker = (props: IListTickerProps) => {
    const { getTicerLastQuote } = props;
    const [itemSearch, setItemSearch] = useState('');
    const [lastQoutes, setLastQoutes] = useState(dafaultLastQuotesData);
    const tradingModel: any = tdpb;
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [handleSymbolList, sethandleSymbolList] = useState<ITickerInfo[]>([]);

    useEffect(() => mapArrayDashboardList(), [lastQoutes])

    const mapArrayDashboardList = () => {

        const getItemSymbolData = (symbolCode: string) => {
            return lastQoutes.find(lastQuotesItem => lastQuotesItem.symbolCode === symbolCode);
        }

        let listData: ITickerInfo[] = [];

        let itemData: ITickerInfo = {
            symbolId: 0,
            tickerName: '',
            ticker: '',
            stockPrice: '',
            previousClose: '',
            open: '',
            high: '',
            low: '',
            lastPrice: '',
            volume: '',
            change: '',
            changePrecent: '',
            side: '',
        };

        symbolList.forEach(item => {
            const itemSymbolData = getItemSymbolData(item.symbolId.toString());
            itemData = {
                tickerName: item.symbolName,
                symbolId: item.symbolId,
                ticker: item.symbolCode,
                previousClose: itemSymbolData?.close,
                open: itemSymbolData?.open,
                high: itemSymbolData?.high,
                low: itemSymbolData?.low,
                lastPrice: (itemSymbolData && itemSymbolData.currentPrice) ? itemSymbolData?.currentPrice : '',
                volume: (itemSymbolData && itemSymbolData.volumePerDay) ? itemSymbolData?.volumePerDay : '',
                change: calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open).toString(),
                changePrecent: ((calculateChange(itemSymbolData?.currentPrice, itemSymbolData?.open) / Number(getItemSymbolData(item.symbolId.toString())?.open)) * 100).toString(),
            }
            listData.push(itemData);
        });
        sethandleSymbolList(listData);
    }

    useEffect(() => {
        getOrderBooks();
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(resp => {
            setLastQoutes(resp.quotesList);
        });
        return () => {
            lastQuotesRes.unsubscribe();
        }
    }, [symbolList])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    const calculateChange = (lastPrice?: string, open?: string) => {
        if (!lastPrice && !open) {
            return 0;
        }
        if (!lastPrice) {
            return Number(open);
        }
        if (!open) {
            return Number(lastPrice);
        }
        return Number(lastPrice) - Number(open)
    }

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

    const handleItemSearch = (itemValue: string) => {
        setItemSearch(itemValue);
    }

    const handleTicker = (item: IAskAndBidPrice, side: string, lastQuote: ILastQuote) => {
        const itemTicker = { ...item, side: side, symbolCode: lastQuote.symbolCode };
        getTicerLastQuote(itemTicker, lastQuote.currentPrice);
    }

    const _renderSearchForm = () => (
        <div className="row mb-2">
            <div className="col-lg-6">
                <div className="input-group input-group-sm input-search">
                    <input type="text" className="form-control form-control-sm border-end-0" value={itemSearch}
                        onChange={(e) => handleItemSearch(e.target.value)} placeholder="Add a ticker" />
                    <button className="btn btn-primary">Add</button>
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
        const listArr: ITickerInfo[] = [];
        let counter = 0;
        handleSymbolList.forEach(item => {
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