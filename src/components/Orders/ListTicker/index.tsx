import { useEffect, useState } from "react";
import { IAskPrice, IBidPrice, ILastQuote, ITickerInfo } from "../../../interfaces/order.interface";
import { LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './listTicker.scss';

interface IListTickerProps {
    getTicerLastQuote: (item: ILastQuote) => void;
}

const defaultProps = {
    getTicerLastQuote: null
}

const dafaultLastQuotesData: ILastQuote[] = [];

const ListTicker = (props: IListTickerProps) => {
    const { getTicerLastQuote } = props;
    const [itemSearch, setItemSearch] = useState('');
    const [lastQoutes, setLastQoutes] = useState(dafaultLastQuotesData);

    useEffect(() => {
        const interval = setInterval(() => {
            handleDataFromWs();
            callWs();
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const callWs = () => {
        setTimeout(() => {
            getOrderBooks();
        }, 500);
    }

    const getOrderBooks = () => {
        const symbplId = LIST_TICKER_INFOR_MOCK_DATA.find((item: ITickerInfo) =>
            item.ticker.toLocaleLowerCase() === itemSearch.toLocaleLowerCase()
            || item.tickerName.toLocaleLowerCase() === itemSearch.toLocaleLowerCase())?.symbolId.toString();
        const data = [];

        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQoutes = new pricingServicePb.GetLastQuotesRequest();
            LIST_TICKER_INFOR_MOCK_DATA.forEach(item => {
                lastQoutes.addSymbolCode(item.symbolId.toString())
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQoutes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }

    }

    const handleItemSearch = (event: any) => {
        setItemSearch(event.target.value);
    }

    const handleDataFromWs = () => {
        const data = wsService.getDataLastQuotes();
        setLastQoutes(data.quotesList);
    }

    const handleTicker = (item: ILastQuote) => {
        getTicerLastQuote(item);
    }

    const _renderSearchForm = () => (
        <div className="row mb-2">
            <div className="col-lg-6">
                <div className="input-group input-group-sm">
                    <input type="text" className="form-control form-control-sm border-end-0" value={itemSearch}
                        onChange={handleItemSearch} placeholder="Add a ticker" />
                    <button className="btn btn-primary">Add</button>
                </div>
            </div>
        </div>
    )

    const _renderAskPrice = (askItems: IAskPrice[]) => (
        <>
            <tr>
                <td className="text-end w-33" >&nbsp;</td>
                <td className="text-center">{askItems[0] ? askItems[0].price : 0}</td>
                <td className="text-danger w-33">{askItems[0] ? `${askItems[0].volume}(${askItems[0].numOrders})` : 0}</td>
            </tr>
            <tr>
                <td className="text-end w-33">&nbsp;</td>
                <td className="text-center">{askItems[1] ? askItems[1].price : 0}</td>
                <td className="text-danger w-33">{askItems[1] ? `${askItems[1].volume}(${askItems[1].numOrders})` : 0}</td>
            </tr>
            <tr>
                <td className="text-end w-33">&nbsp;</td>
                <td className="text-center">{askItems[2] ? askItems[2].price : 0}</td>
                <td className="text-danger w-33">{askItems[2] ? `${askItems[2].volume}(${askItems[2].numOrders})` : 0}</td>
            </tr>
        </>

    )

    const _renderBidPrice = (bidItems: IBidPrice[]) => {
        let arr: IBidPrice[] = [];
        const defaultBidPrice: IBidPrice = {
            numOrders: 0,
            price: '0',
            tradable: false,
            volume: '0'
        }
        if (bidItems.length === 1) {
            arr = [defaultBidPrice, defaultBidPrice, bidItems[0]];
        } else if (bidItems.length === 2) {
            arr = [defaultBidPrice, bidItems[1], bidItems[0]];
        } else {
            arr = bidItems.reverse();
        }
        return (
            <>
                <tr>
                    <td className="text-end text-success w-33">{arr[0] ? `${arr[0].volume} (${arr[0].numOrders})` : 0}</td>
                    <td className="text-center">{arr[0] ? arr[0].price : 0}</td>
                    <td className="text-end w-33">&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end text-success w-33">{arr[1] ? `${arr[1].volume} (${arr[1].numOrders})` : 0}</td>
                    <td className="text-center">{arr[1] ? arr[1].price : 0}</td>
                    <td className="text-end w-33">&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end text-success w-33">{arr[2] ? `${arr[2].volume} (${arr[2].numOrders})` : 0}</td>
                    <td className="text-center">{arr[2] ? arr[2].price : 0}</td>
                    <td className="text-end w-33">&nbsp;</td>
                </tr>
            </>
        )
    }

    const renderListDataTicker = lastQoutes.map((item: ILastQuote) => {
        const symbol = LIST_TICKER_INFOR_MOCK_DATA.find((o: ITickerInfo) => o.symbolId.toString() === item.symbolCode);
        if (item.asksList.length > 0 || item.bidsList.length > 0) {
            return <div className="col-xl-3">
                <table onClick={() => handleTicker(item)}
                    className="table-item-ticker table table-sm table-hover border mb-1" key={item.symbolCode}
                >
                    <thead>
                        <tr>
                            <th colSpan={3} className="text-center">
                                <div className="position-relative">
                                    <strong className="px-4">{symbol?.ticker}</strong>
                                    <a href="#" className="position-absolute me-1" style={{ right: 0 }} >
                                        <i className="bi bi-x-lg" />
                                    </a>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {_renderBidPrice(item.bidsList)}
                        {_renderAskPrice(item.asksList)}
                    </tbody>
                </table>

            </div>
        }
        return ''
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