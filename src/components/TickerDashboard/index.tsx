import { useEffect, useState } from "react"
import { SOCKET_CONNECTED, LIST_TICKER_INFO, LIST_PRICE_TYPE, SYMBOL_LIST } from "../../constants/general.constant"
import { assignListPrice, calcChange, calcPctChange, checkValue, formatCurrency, formatNumber } from "../../helper/utils"
import { IDetailTickerInfo, ILastQuote, ITickerInfo } from "../../interfaces/order.interface";
import * as psbp from "../../models/proto/pricing_service_pb";
import * as rpcpb from '../../models/proto/rpc_pb';
import { IListDashboard } from "../../interfaces/ticker.interface";
import { wsService } from "../../services/websocket-service";
import './TickerDashboard.scss';
import { IQuoteEvent } from "../../interfaces/quotes.interface";

interface ITickerDashboard {
    handleTickerInfo: (item: ILastQuote) => void;
    handleQuoteEvent: (item: ITickerInfo) => void;
    listDataTicker: ITickerInfo[];
}

const defaultProps = {
    handleTickerInfo: null,
}

const TickerDashboard = (props: ITickerDashboard) => {
    const { handleTickerInfo, handleQuoteEvent, listDataTicker } = props;
    const [tickerCode, setTickerCode] = useState('');
    const [listData, setListData] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [symbolList, setSymbolList] = useState<any[]>([])
    

    useEffect(() => {
        const subscribeQuoteRes = wsService.getSubscribeQuoteSubject().subscribe(resp => {
            console.log(resp);
        });

        const symbols =  wsService.getSymbolListSubject().subscribe(resp => {
            if (resp && resp.symbolList) {
                setSymbolList(resp.symbolList);
            }
        })

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setLastQuotes(quote.quotesList);
            }
        })

        return () => {
            unSubscribeQuoteEvent();
            subscribeQuoteRes.unsubscribe();
            quoteEvent.unsubscribe();
            lastQuote.unsubscribe();
            symbols.unsubscribe();
        }
    }, []);

    useEffect(() => {
        processQuote(quoteEvent);
    }, [quoteEvent])

    useEffect(() => {
        processLastQuote(lastQuotes)
    }, [lastQuotes])

    const processLastQuote = (quotes: ILastQuote[]) => {
        setListData(quotes);
    }

    const processQuote = (quotes: IQuoteEvent[]) => {
        const tmpList = [...lastQuotes];
        if (quotes && quotes.length > 0 && tmpList && tmpList.length > 0) {
            quotes.forEach(item => {
               const index = tmpList.findIndex(o => o?.symbolCode === item?.symbolCode);
               if (index >= 0) {
                   tmpList[index] = {
                       ...tmpList[index],
                        currentPrice: checkValue(tmpList[index].currentPrice, item.currentPrice),
                        volume: checkValue(tmpList[index].volume, item.volumePerDay),
                        high: checkValue(tmpList[index].high, item.high),
                        low: checkValue(tmpList[index].low, item.low),
                        open: checkValue(tmpList[index].open, item.open),
                        asksList: item.asksList,
                        bidsList: item.bidsList,
                        close: checkValue(tmpList[index].close, item.close)
                   }
               }
            });
            setListData(tmpList);
            setLastQuotes(tmpList);
        }
    }

    const unSubscribeQuoteEvent = () => {
        const pricingServicePb: any = psbp;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest ();
            symbolList.forEach(item => {
                unsubscribeQuoteReq.addSymbolCode(item.ticker);
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const onClickTickerInfo = (item: ILastQuote) => {
        if (item) {
            setTickerCode(item.symbolCode);
            handleTickerInfo(item);
        }
    }

    const getNameClass = (item: number) => {
        if (item > 0) {
            return "text-success"
        }
        if(item < 0 ) {
            return "text-danger"
        }else{
            return ""
        }
    }

    const headerTable = () => (
        <tr>
            <th className="text-nowrap  sorting_disabled header-cell fz-14 w-ticker-name">
                Ticker Name
            </th>
            <th className="text-left sorting_disabled header-cell w-header fz-14">
                Ticker Code
            </th>
            <th className=" text-end sorting_disabled header-cell w-header fz-14">
                Prev. Close
            </th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">
                Open
            </th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">
                High
            </th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">
                Low
            </th>
            <th className=" text-end sorting_disabled header-cell w-header">
                <span className="fz-14 pl-6">Last Price</span>
            </th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">
                Volume
            </th>
            <th className="text-end sorting_disabled header-cell w-header fz-14">
                Change
            </th>
            <th className="text-end sorting_disabled header-cell w-change-pct fz-14">
                Change%
            </th>
            <th className="w-px-15">
                &nbsp;
            </th>
        </tr>
    )

    const renderSymbolName = (symbolCode: string) => {
        if (symbolList.length > 0) {
            const item = symbolList.find(o => o?.symbolCode === symbolCode);
            if (item) {
                return item.symbolName;
            }
        }
        return '';
    }
    

    const renderDataListCompany = () => {
        return listData.map((item: ILastQuote, index) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)}>
                <td className="text-left w-ticker-name fw-600">{renderSymbolName(item.symbolCode)}</td>
                <td className="text-left w-header fw-600">{item.symbolCode}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.close || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.open || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.high || '')}</td>
                <td className="text-end w-header fw-600">{formatCurrency(item.low || '')}</td>
                <td className="text-end w-header fw-600"><span className={getNameClass(Number(item.currentPrice))}>{formatCurrency(item.currentPrice)}</span></td>
                <td className="text-end w-header fw-600">{formatNumber(item.volumePerDay)}</td>
                <td className="text-end w-header fw-600"><span className={getNameClass(calcChange(item.currentPrice, item.open || ''))}>
                    {formatNumber(calcChange(item.currentPrice, item.open || '').toString())}
                </span></td>
                <td className="text-end w-change-pct fw-600 align-middle"><span className={getNameClass(calcPctChange(item.currentPrice, item.open || ''))}>
                    {formatCurrency(calcPctChange(item.currentPrice, item.open || '').toString())}%</span>
                </td>
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