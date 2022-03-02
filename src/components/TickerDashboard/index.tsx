import { useEffect, useState } from "react"
import { SOCKET_CONNECTED, LIST_TICKER_INFO } from "../../constants/general.constant"
import { assignListPrice, checkValue, formatCurrency, formatNumber } from "../../helper/utils"
import { IDetailTickerInfo, ITickerInfo } from "../../interfaces/order.interface";
import * as psbp from "../../models/proto/pricing_service_pb";
import * as rpcpb from '../../models/proto/rpc_pb';
import { IListDashboard } from "../../interfaces/ticker.interface";
import { wsService } from "../../services/websocket-service";
import './TickerDashboard.scss';
import { IQuoteEvent } from "../../interfaces/quotes.interface";

interface ITickerDashboard {
    handleTickerInfo: (item: ITickerInfo) => void;
    listDataTicker: ITickerInfo[];
}

const defaultProps = {
    handleTickerInfo: null,
}

const TickerDashboard = (props: ITickerDashboard) => {
    const { handleTickerInfo, listDataTicker } = props;
    const [tickerCode, setTickerCode] = useState('');
    const [listData, setListData] = useState(listDataTicker ? listDataTicker : []);

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                subscribeQuoteEvent();
            }
        });

        const subscribeQuoteRes = wsService.getSubscribeQuoteSubject().subscribe(resp => {
            console.log(resp);
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                processQuote(quote.quoteList);
            }
        });

        return () => {
            unSubscribeQuoteEvent();
            ws.unsubscribe();
            subscribeQuoteRes.unsubscribe();
            quoteEvent.unsubscribe();
        }
    }, [tickerCode]);

    useEffect(() => {
        renderData();
    }, [listDataTicker]);

    const renderData = () => {
        if (listDataTicker) {
            setListData(listDataTicker);
        }
    }

    const processQuote = (quotes: IQuoteEvent[]) => {
        const tmpList = [...listData];
        if (tmpList && tmpList.length > 0) {
            quotes.forEach(item => {
               const index = tmpList.findIndex(o => o?.ticker === item?.symbolCode);
               if (index >= 0) {
                   tmpList[index] = {
                       ...tmpList[index],
                        change: checkValue(tmpList[index].change, item.netChange),
                        changePrecent: checkValue(tmpList[index].changePrecent, item.pctChange),
                        lastPrice: checkValue(tmpList[index].lastPrice, item.close),
                        volume: checkValue(tmpList[index].volume, item.volumePerDay),
                        high: checkValue(tmpList[index].high, item.high),
                        low: checkValue(tmpList[index].low, item.low),
                        open: checkValue(tmpList[index].open, item.open),
                        asks: !tmpList[index].asks ? assignListPrice([], item.asks) : assignListPrice(tmpList[index].asks, item.asks),
                        bids: !tmpList[index].bids ? assignListPrice([], item.bids) : assignListPrice(tmpList[index].bids, item.bids),
                   }
               }
            });
            setListData(tmpList);
        }
    }

    const subscribeQuoteEvent = () => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        const listSymbol = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            listSymbol.forEach(item => {
                subscribeQuoteEventReq.addSymbolCode(item.ticker);
            })
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.SUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(subscribeQuoteEventReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const unSubscribeQuoteEvent = () => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest ();
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const onClickTickerInfo = (item: ITickerInfo) => {
        if (item) {
            setTickerCode(item.ticker);
            handleTickerInfo(item);
        }
    }


    const headerTable = () => (
        <tr>
            <th className="text-nowrap  sorting_disabled header-cell fz-14 w-px-150">
                Ticker Name
            </th>
            <th className="text-left sorting_disabled header-cell w-ss fz-14">
                Ticker Code
            </th>
            <th className=" text-end sorting_disabled header-cell w-ss fz-14">
                Prev. Close
            </th>
            <th className="text-end sorting_disabled header-cell w-ss fz-14">
                Open
            </th>
            <th className="text-end sorting_disabled header-cell w-ss fz-14">
                High
            </th>
            <th className="text-end sorting_disabled header-cell w-ss fz-14">
                Low
            </th>
            <th className=" text-end sorting_disabled header-cell w-ss">
                <span className="fz-14 pl-6">Last Price</span>
            </th>
            <th className="text-end sorting_disabled header-cell w-ss fz-14">
                Volume
            </th>
            <th className="text-end sorting_disabled header-cell w-ss fz-14">
                Change
            </th>
            <th className="text-end sorting_disabled header-cell w-ss fz-14">
                Change%
            </th>
            <th className="w-px-15">
                &nbsp;
            </th>
        </tr>
    )

    const renderDataListCompany = () => (
        listData.map((item: any, index: number) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)}>
                <td className="text-left w-px-150 fw-600">{item.tickerName}</td>
                <td className="text-left w-ss fw-600">{item.ticker}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.previousClose)}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.open)}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.high)}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.low)}</td>
                <td className="text-end w-ss fw-600"><span className={Number(item.lastPrice) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.lastPrice)}</span></td>
                <td className="text-end w-ss fw-600">{formatNumber(item.volume)}</td>
                <td className="text-end w-ss fw-600"><span className={item.change >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.change)}</span></td>
                <td className="text-end w-ss fw-600"><span className={item.changePrecent >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.changePrecent)}%</span></td>
            </tr>
        ))
    )

    const _renderTableData = () => (
        <div className="dataTables_scroll">
            <div className="dataTables_scrollHead">
                <div className="dataTables_scrollHeadInner"></div>
            </div>
            <div className="dataTables_scrollBody">
                <table id="table" className="table table-sm table-hover mb-0 dataTable no-footer fixed_headers" >
                    <thead className="thead">
                        {headerTable()}
                    </thead>

                    <tbody className="bt-none fs-14 scroll scroll-tbody">
                        {renderDataListCompany()}
                    </tbody>
                </table>
            </div>
        </div>
    )


    const setTableData = () => (
        <div className="table-responsive bg-white">
            <div id="table_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                <div className="row">
                    <div className="col-sm-12">
                        {_renderTableData()}
                    </div>
                </div>
            </div>
        </div>
    )

    return <div className="border border-2 bg-light">
        {setTableData()}
    </div>
}

TickerDashboard.defaultProps = defaultProps

export default TickerDashboard