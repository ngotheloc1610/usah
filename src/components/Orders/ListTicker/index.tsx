import { useEffect, useState } from "react";
import { IAskPrice, IBidPrice, ILastQuote, ITickerInfo } from "../../../interfaces/order.interface";
import { LIST_DATA_TICKERS, LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";

const dafaultLastQuotesData: ILastQuote[] = [];

const ListTicker = () => {
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

    const _renderSearchForm = () => (
        <div className="row mb-2">
            <div className="col-lg-6">
                <div className="input-group input-group-sm">
                    <input type="text" className="form-control form-control-sm border-end-0" value={itemSearch}
                        onChange={handleItemSearch} placeholder="Add a ticker" />
                    <button className="btn btn-primary" onClick={getOrderBooks}>Add</button>
                </div>
            </div>
        </div>
    )

    const _renderAskPrice = (askItems: IAskPrice[]) => {
        return askItems.map((item: IAskPrice, index: number) => (
            <tr key={index}>
                <td className="text-end">&nbsp;</td>
                <td className="text-center">{item.price}</td>
                <td className="text-danger">{item.volume} ({item.numOrders})</td>
            </tr>
        ))

    }

    const _renderBidPrice = (bidItems: IBidPrice[]) => {
        const arr = [];
        for (let i = bidItems.length - 1; i >= 0; i--) {
            arr.push(bidItems[i]);
        }
        return arr.map((item: IBidPrice, index: number) => (
            <tr key={index}>
                <td className="text-end text-success">{item.volume} ({item.numOrders})</td>
                <td className="text-center">{item.price}</td>
                <td className="text-end">&nbsp;</td>
            </tr>
        ))

    }

    const renderListDataTicker = lastQoutes.map((item: ILastQuote) => {
        const symbol = LIST_TICKER_INFOR_MOCK_DATA.find((o: ITickerInfo) => o.symbolId.toString() === item.symbolCode);
        if (item.asksList.length > 0 || item.bidsList.length > 0) {
            return <div className="col-xl-3">
                <table
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
export default ListTicker;