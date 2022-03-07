import { useEffect, useState } from "react"
import { SOCKET_CONNECTED, LIST_TICKER_INFO, LIST_PRICE_TYPE } from "../../constants/general.constant"
import { assignListPrice, calcChange, calcPctChange, checkValue, formatCurrency, formatNumber } from "../../helper/utils"
import { IDetailTickerInfo, ITickerInfo } from "../../interfaces/order.interface";
import * as psbp from "../../models/proto/pricing_service_pb";
import * as rpcpb from '../../models/proto/rpc_pb';
import { IListDashboard } from "../../interfaces/ticker.interface";
import { wsService } from "../../services/websocket-service";
import './TickerDashboard.scss';
import { IQuoteEvent } from "../../interfaces/quotes.interface";

interface ITickerDashboard {
    handleTickerInfo: (item: ITickerInfo) => void;
    handleQuoteEvent: (item: ITickerInfo) => void;
    listDataTicker: ITickerInfo[];
}

const defaultProps = {
    handleTickerInfo: null,
}

const TickerDashboard = (props: ITickerDashboard) => {
    const { handleTickerInfo, handleQuoteEvent, listDataTicker } = props;
    const [tickerCode, setTickerCode] = useState('');
    const [listData, setListData] = useState(listDataTicker ? listDataTicker : []);
    const [quoteEvent, setQuoteEvent] = useState([]);
    const symbolList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                getLastQuote();
                unSubscribeQuoteEvent();
            }
        });

        const unsubscribeResp = wsService.getUnsubscribeQuoteSubject().subscribe(resp => {
            if (resp.msgText === "SUCCESS") {
                subscribeQuoteEvent();
            }
            
        })

        const subscribeQuoteRes = wsService.getSubscribeQuoteSubject().subscribe(resp => {
            console.log(resp);
        });

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setListData(quote.quotesList);
            }
        })

        return () => {
            unSubscribeQuoteEvent();
            ws.unsubscribe();
            subscribeQuoteRes.unsubscribe();
            quoteEvent.unsubscribe();
            lastQuote.unsubscribe();
            unsubscribeResp.unsubscribe();
        }
    }, []);

    useEffect(() => {
        renderData();
    }, [listDataTicker]);

    useEffect(() => {
        processQuote(quoteEvent);
    }, [quoteEvent])

    const renderData = () => {
        if (listDataTicker) {
            setListData(listDataTicker);
        }
    }

    const processQuote = (quotes: IQuoteEvent[]) => {
        const tmpList = [...symbolList];
        if (quotes && quotes.length > 0 && tmpList && tmpList.length > 0) {
            quotes.forEach(item => {
               const index = tmpList.findIndex(o => o?.symbolId.toString() === item?.symbolCode);
               if (index >= 0) {
                   tmpList[index] = {
                       ...tmpList[index],
                        change: assignChangeValue(tmpList[index], item).toString(),
                        changePrecent: assignPctChangeValue(tmpList[index], item).toString(),
                        lastPrice: checkValue(tmpList[index].lastPrice, item.currentPrice),
                        volume: checkValue(tmpList[index].volume, item.volumePerDay),
                        high: checkValue(tmpList[index].high, item.high),
                        low: checkValue(tmpList[index].low, item.low),
                        open: checkValue(tmpList[index].open, item.open),
                        asks: !tmpList[index].asks ? assignListPrice([], item.asksList, LIST_PRICE_TYPE.askList) : assignListPrice(tmpList[index].asks, item.asksList, LIST_PRICE_TYPE.askList),
                        bids: !tmpList[index].bids ? assignListPrice([], item.bidsList, LIST_PRICE_TYPE.bidList) : assignListPrice(tmpList[index].bids, item.bidsList, LIST_PRICE_TYPE.bidList),
                        previousClose: checkValue(tmpList[index].previousClose, item.close)
                        
                   }
               }
            });
            const element = tmpList.find(o => o?.ticker === tickerCode);
            if (element) {
                handleQuoteEvent(element);
            }
            setListData(tmpList);
        }
    }

    const assignChangeValue = (tickerInfo: ITickerInfo, quote: IQuoteEvent) => {
        const lastPrice = checkValue(tickerInfo.lastPrice, quote.currentPrice);
        const open = checkValue(tickerInfo.open, quote.open);
        return calcChange(lastPrice, open);
    }

    const assignPctChangeValue = (tickerInfo: ITickerInfo, quote: IQuoteEvent) => {
        const lastPrice = checkValue(tickerInfo.lastPrice, quote.currentPrice);
        const open = checkValue(tickerInfo.open, quote.open);
        return  calcPctChange(lastPrice, open);
    }

    const subscribeQuoteEvent = () => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let subscribeQuoteEventReq = new pricingServicePb.SubscribeQuoteEventRequest();
            symbolList.forEach(item => {
                subscribeQuoteEventReq.addSymbolCode(item.symbolId.toString());
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
            symbolList.forEach(item => {
                unsubscribeQuoteReq.addSymbolCode(item.symbolId.toString());
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const getLastQuote = () => {
        const pricingServicePb: any = psbp;
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

    const renderDataListCompany = () => {
        return listData.map((item: ITickerInfo, index: number) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)}>
                <td className="text-left w-px-150 fw-600">{item.tickerName}</td>
                <td className="text-left w-ss fw-600">{item.ticker}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.previousClose || '')}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.open || '')}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.high || '')}</td>
                <td className="text-end w-ss fw-600">{formatCurrency(item.low || '')}</td>
                <td className="text-end w-ss fw-600"><span className={Number(item.lastPrice) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.lastPrice)}</span></td>
                <td className="text-end w-ss fw-600">{formatNumber(item.volume)}</td>
                <td className="text-end w-ss fw-600"><span className={Number(item.change) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.change)}</span></td>
                <td className="text-end w-ss fw-600"><span className={Number(item.changePrecent) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.changePrecent)}%</span></td>
            </tr>
        ))
    }

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