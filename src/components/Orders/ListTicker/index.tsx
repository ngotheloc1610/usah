import { useEffect, useState } from "react";
import { LIST_DATA_TICKERS } from "../../../mocks";
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";

const ListTicker = () => {
    const [wsConnected, setWsConnected] = useState(false)
    useEffect(() => {
        setTimeout(() => {
            getOrderBooks();
        }, 1000)
    }, []);

    const connectWs = () => {
        
        setWsConnected(wsConnected)
    }

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        console.log(19, wsConnected)
        if (wsConnected) {
            let lastQoutes = new pricingServicePb.GetLastQuotesRequest();
            lastQoutes.addSymbolCode("1");
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQoutes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const listDataTicker = LIST_DATA_TICKERS;
    const renderListDataTicker = listDataTicker.map(item => {
        return <div className="col-6 col-md-3 col-xl-2">
        <table
            className="table-item-ticker table table-sm table-hover border mb-1"
        >
            <thead>
                <tr>
                    <th colSpan={3} className="text-center">
                        <div className="position-relative">
                            <strong className="px-4">AAPL</strong>
                            <a href="#" className="position-absolute me-1" onClick={getOrderBooks} style={{ right: 0 }} >
                                <i className="bi bi-x-lg" />
                            </a>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="text-end text-success">{item.volume3Order} ({item.number3Order})</td>
                    <td className="text-center">{item.price3Order}</td>
                    <td className="text-end">&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end text-success">{item.volume2Order} ({item.number2Order})</td>
                    <td className="text-center">{item.price2Order}</td>
                    <td className="text-end">&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end text-success">{item.volume1Order} ({item.number1Order})</td>
                    <td className="text-center">{item.price1Order}</td>
                    <td className="text-end">&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end">&nbsp;</td>
                    <td className="text-center">{item.bid1Price}</td>
                    <td className="text-end text-danger">{item.bid1Volume} ({item.bid1Number})</td>
                </tr>
                <tr>
                    <td className="text-end">&nbsp;</td>
                    <td className="text-center">{item.bid2Price}</td>
                    <td className="text-end text-danger">{item.bid2Volume} ({item.bid2Number})</td>
                </tr>
                <tr>
                    <td className="text-end">&nbsp;</td>
                    <td className="text-center">{item.bid1Price}</td>
                    <td className="text-end text-danger">{item.bid1Volume} ({item.bid1Number})</td>
                </tr>
            </tbody>
        </table>

    </div>
    })
    return (

        <div className="row row-monitoring g-2">
            {renderListDataTicker}
        </div>
    )
}
export default ListTicker;