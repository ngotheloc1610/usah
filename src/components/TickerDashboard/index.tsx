import { useEffect, useState } from "react"
import { OBJ_AUTHEN, SOCKET_CONNECTED } from "../../constants/general.constant"
import { formatCurrency, formatNumber } from "../../helper/utils"
import { ILastQuote, ITickerInfo } from "../../interfaces/order.interface"
import { wsService } from "../../services/websocket-service"
import * as qspb from '../../models/proto/query_service_pb'
import * as rspb from "../../models/proto/rpc_pb";
import * as pspb from '../../models/proto/pricing_service_pb'
import queryString from 'query-string';
import './TickerDashboard.scss'
import ReduxPersist from "../../config/ReduxPersist"
import { IListDashboard, ISymbolList } from "../../interfaces/ticker.interface"

interface ITickerDashboard {
    handleTickerInfo: (item: ITickerInfo) => void
}

const defaultProps = {
    handleTickerInfo: null,
}

const dafaultLastQuotesData: ILastQuote[] = []

const TickerDashboard = (props: ITickerDashboard) => {
    const { handleTickerInfo } = props;
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])
    const [lastQuotes, setLastQuotes] = useState(dafaultLastQuotesData)
    const [listDataDashboard, setDataDashboard] = useState<IListDashboard[]>([])

    const onClickTickerInfo = (item: ITickerInfo) => {
        handleTickerInfo(item);
    }

    const calculateChange = (lastPrice?: string, open?: string) => {
        return Number(lastPrice) - Number(open)
    }

    useEffect(() => mapArrayDashboardList(), [lastQuotes])

    const mapArrayDashboardList = () => {
    
        const getItemSymbolData = (symbolCode: string) => {
            return lastQuotes.find(lastQuotesItem => lastQuotesItem.symbolCode === symbolCode);
        }

        let listData: IListDashboard[] = [];

        let itemData: IListDashboard = {
            symbolName: '',
            symbolCode: '',
            previousClose: '',
            open: '',
            high: '',
            low: '',
            lastPrice: '',
            volume: '',
            change: 0,
            percentChange: 0,
        };

        symbolList.forEach(item => {
            itemData = {
                symbolName: item.symbolName,
                symbolCode: item.symbolCode,
                previousClose: getItemSymbolData(item.symbolId.toString())?.close,
                open: getItemSymbolData(item.symbolId.toString())?.open,
                high: getItemSymbolData(item.symbolId.toString())?.high,
                low: getItemSymbolData(item.symbolId.toString())?.low,
                lastPrice: getItemSymbolData(item.symbolId.toString())?.currentPrice,
                volume: getItemSymbolData(item.symbolId.toString())?.volumePerDay,
                change: calculateChange(getItemSymbolData(item.symbolId.toString())?.currentPrice, getItemSymbolData(item.symbolId.toString())?.open),
                percentChange: calculateChange(getItemSymbolData(item.symbolId.toString())?.currentPrice, getItemSymbolData(item.symbolId.toString())?.open)/100,
            }
            listData.push(itemData);
        })

        setDataDashboard(listData)
    }

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessage();
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

    useEffect(() => {
        sendMessageQuotes()
        const lastQuotesRes = wsService.getDataLastQuotes().subscribe(res => {
            setLastQuotes(res.quotesList);
        });
        return () => {
            lastQuotesRes.unsubscribe();
        }
    }, [symbolList])

    const buildMessage = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let symbolListRequest = new queryServicePb.SymbolListRequest();
            symbolListRequest.setAccountId(Number(accountId));

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.SYMBOL_LIST_REQ);
            rpcMsg.setPayloadData(symbolListRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMessage = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessage(accountId)
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessage(accountId)
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                buildMessage(accountId)
                return;
            }
        });
    }

    const sendMessageQuotes = () => {
        const pricingServicePb: any = pspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();
            symbolList.forEach(item => {
                lastQuotesRequest.addSymbolCode(item.symbolId.toString())
            });
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const headerTable = () => (
        <>
            <th className="text-nowrap  sorting_disabled header-cell w-px-150">
                Company Name
            </th>
            <th className="text-left sorting_disabled header-cell w-px-80">
                Ticker
            </th>
            <th className="text-nowrap text-end sorting_disabled header-cell w-px-100">
                Previous Close
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Open
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                High
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Low
            </th>
            <th className="text-nowrap text-end sorting_disabled header-cell w-px-80">
                Last price
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Volume
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Change
            </th>
            <th className="text-end sorting_disabled header-cell w-px-80">
                Change%
            </th>
            <th className="w-px-15">
                &nbsp;
            </th>
        </>
    )
    
    const renderDataListCompany = () => (
        listDataDashboard.map((item: any, index: number) => (
            <tr key={index} onClick={() => onClickTickerInfo(item)}>
                <td className="w-px-150 fw-600">{item.symbolName}</td>
                <td className="text-left w-px-80 fw-600">{item.symbolCode}</td>
                <td className="text-end w-px-100 fw-600">{formatCurrency(item.previousClose)}</td>
                <td className="text-end w-px-80 fw-600">{formatCurrency(item.open)}</td>
                <td className="text-end w-px-80 fw-600">{formatCurrency(item.high)}</td>
                <td className="text-end w-px-80 fw-600">{formatCurrency(item.low)}</td>
                <td className="text-end w-px-80 fw-600"><span className={Number(item.lastPrice) >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.lastPrice)}</span></td>
                <td className="text-end w-px-80 fw-600"><span className={Number(item.volume) >= 0 ? 'text-success' : 'text-danger'}>{formatNumber(item.volume)}</span></td>
                <td className="text-end w-px-80 fw-600"><span className={item.change >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.change)}</span></td>
                <td className="text-end w-px-80 fw-600"><span className={item.percentChange >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(item.percentChange)}%</span></td>
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
                    <thead>
                        {headerTable()}
                    </thead>

                    <tbody className="bt-none fs-14 scroll-tbody">
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