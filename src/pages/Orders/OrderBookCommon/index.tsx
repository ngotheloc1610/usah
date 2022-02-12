import { useEffect, useState } from 'react';
import OrderForm from '../../../components/Order/OrderForm';
import OrderBookList from '../../../components/Orders/OrderBookCommon/OrderBookList';
import OrderBookTickerDetail from '../../../components/Orders/OrderBookCommon/OrderBookTickerDetail';
import OrderBookTradeHistory from '../../../components/Orders/OrderBookCommon/OrderBookTradeHistory';
import { STYLE_LIST_BIDS_ASK } from '../../../constants/order.constant';
import { IAskAndBidPrice, IDetailTickerInfo, IStyleBidsAsk, ITickerInfo, ITradeHistory } from '../../../interfaces/order.interface';
import { ILastQuote } from '../../../interfaces/order.interface';
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './OrderBookCommon.scss';
import queryString from 'query-string';
import * as qspb from "../../../models/proto/query_service_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import { SOCKET_CONNECTED, TICKER_DETAIL } from '../../../constants/general.constant';
import sendMsgSymbolList from '../../../Common/sendMsgSymbolList';
import { IListDashboard, ISymbolList } from '../../../interfaces/ticker.interface';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const defaultDataTicker: ILastQuote = {
    asksList: [],
    bidsList: [],
    close: '',
    currentPrice: '',
    high: '',
    low: '',
    netChange: '',
    open: '',
    pctChange: '',
    quoteTime: 0,
    scale: 0,
    symbolCode: '',
    symbolId: 0,
    tickPerDay: 0,
    volumePerDay: '',
}
const defaultTickerInf = {
    symbolId: 0,
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
}
const defaultCurrentTicker: ITickerInfo | any = {
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
}
const OrderBookCommon = () => {
    const [isEarmarkSpreadSheet, setEarmarkSpreadSheet] = useState<boolean>(true);

    const [getDataTradeHistory, setGetDataTradeHistory] = useState<ITradeHistory[]>([]);
    const [isSpreadsheet, setSpreadsheet] = useState<boolean>(false);
    const [isGrid, setGrid] = useState<boolean>(false);
    const [isColumns, setColumns] = useState<boolean>(false);
    const [isColumnsGap, setColumnsGap] = useState<boolean>(false);
    const [currentTicker, setCurrentTicker] = useState(defaultCurrentTicker);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolCode, setSymbolCode] = useState<string>('');
    const [itemTickerInfor, setItemTickerInfor] = useState<IListDashboard>(defaultTickerInf);
    const [listDataDashboard, setDataDashboard] = useState<IListDashboard[]>([])
    const [itemTickerDetail, setItemTickerDetail] = useState<ILastQuote>(defaultDataTicker);
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([])

    const defaultData = () => {
        setEarmarkSpreadSheet(false);
        setSpreadsheet(false);
        setGrid(false);
        setColumns(false);
        setColumnsGap(false);
    }
    const dafaultLastQuotesData: ILastQuote[] = [];
    const [itemSearch, setItemSearch] = useState('');

    useEffect(() => searchTicker(), [itemTickerInfor])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList()
                sendMessage();
            }
        });

        const renderDataToScreen = wsService.getTradeHistory().subscribe(res => {
            setGetDataTradeHistory(res.tradeList)
        });

        const tickerDetail = JSON.parse(localStorage.getItem(TICKER_DETAIL) || '{}')
        const listSymbolCode: string[] = []
        tickerDetail.forEach((item: IListDashboard) => {
            listSymbolCode.push(item.symbolCode);
        });
        setListSymbolCode(listSymbolCode)
        setDataDashboard(tickerDetail)

        return () => {
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
        }
    }, []);

    const prepareMessagee = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();

            tradeHistoryRequest.setAccountId(Number(accountId));

            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMessage = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem('objAuthen', JSON.stringify(objAuthen).toString());
                prepareMessagee(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem('objAuthen').then(res => {
            if (res) {
                const obj = JSON.parse(res);
                accountId = obj.account_id;
                prepareMessagee(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ?? '';
                prepareMessagee(accountId);
                return;
            }
        });
    }

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                getOrderBooks()
            }
        });

        const getLastQuotesRes = wsService.getDataLastQuotes().subscribe(response => {
            const tickerDetail = response.quotesList.find((item: ILastQuote) => Number(item.symbolCode) === 1);
            setItemTickerDetail(tickerDetail)
        });

        return () => {
            ws.unsubscribe();
            getLastQuotesRes.unsubscribe();
        }
    }, [listDataDashboard])


    const handleDataFromWs = () => {
        wsService.getDataLastQuotes().subscribe(response => {
            const tickerDetail = response.quotesList.find((item: ILastQuote) => Number(item.symbolCode) === Number(symbolCode));
            setItemTickerDetail(tickerDetail);
        });
    }

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQoutes = new pricingServicePb.GetLastQuotesRequest();
            listDataDashboard.forEach(item => {
                lastQoutes.addSymbolCode(item.symbolId.toString())
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQoutes.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const selectedStyle = (item: string) => {
        defaultData();
        switch (item) {
            case STYLE_LIST_BIDS_ASK.earmarkSpreadSheet: {
                setEarmarkSpreadSheet(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.spreadsheet: {
                setSpreadsheet(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.grid: {
                setGrid(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.columns: {
                setColumns(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.columnsGap: {
                setColumnsGap(true);
                break;
            }
        }
    }

    const listStyleBidsAsk: IStyleBidsAsk = {
        earmarkSpreadSheet: isEarmarkSpreadSheet,
        spreadsheet: isSpreadsheet,
        grid: isGrid,
        columns: isColumns,
        columnsGap: isColumnsGap,
    }

    const _renderListStyle = (isStyle: boolean, itemStyle: string) => (
        <li>
            <a href="#layout-1"
                className={`btn btn-sm btn-outline-secondary mx-1 ${isStyle ? 'selected' : ''}`}
                onClick={() => selectedStyle(itemStyle)}>
                <i className={`bi bi-${itemStyle}`}></i></a>
        </li>
    )

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
    }

    const getTickerSearch = (itemTicker: any) => {
        const itemTickerInfor = listDataDashboard.find(item => item.symbolCode === (itemTicker.target.innerText).toUpperCase());
        setItemTickerInfor(itemTickerInfor ? itemTickerInfor : defaultTickerInf);
        setSymbolCode(itemTickerInfor ? itemTickerInfor.symbolId.toString() : '');
    }

    const searchTicker = () => {
        if (symbolCode !== '') {
            getOrderBooks();
            handleDataFromWs();
            return;
        }
        setItemTickerDetail(defaultDataTicker);
    }

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            const itemTickerInfor = listDataDashboard.find(item => item.symbolCode === (event.target.value).toUpperCase());
            setItemTickerInfor(itemTickerInfor ? itemTickerInfor : defaultTickerInf);
            setSymbolCode(itemTickerInfor ? itemTickerInfor.symbolId.toString() : '');

            searchTicker()
        }
    }

    const assgnDataFormNewOrder = (item: IAskAndBidPrice) => {
        const assTickerInfor = itemTickerInfor;
        const itemTicker = {
            tickerName: assTickerInfor?.symbolName,
            ticker: assTickerInfor?.symbolCode,
            lastPrice: item.price,
            volume: item.volume,
            side: item.side,
            symbolId: assTickerInfor?.symbolId
        }
        setCurrentTicker(itemTicker);
    }

    const _renderTemplateSearchTicker = () => (
        <div className="row g-2 justify-content-end">
            <div className="col-md-3">
                <div className="input-group input-group-sm mb-2">
                    <Autocomplete
                        onChange={getTickerSearch}
                        onKeyUp={handleKeyUp}
                        onClick={searchTicker}
                        disablePortal
                        options={listSymbolCode}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} placeholder="Search" />}
                    />
                </div>
            </div>
        </div>
    )

    const _renderTemplateOrderBookCommon = () => (
        <div className="site-main">
            <div className="container">
                <div className="row g-2 align-items-center">
                    <div className="col-md-9">
                        {_renderTemplateSearchTicker()}
                    </div>
                    <div className="col-md-3">
                        <ul className="idTabs nav align-items-center justify-content-center mb-2">
                            {_renderListStyle(isEarmarkSpreadSheet, STYLE_LIST_BIDS_ASK.earmarkSpreadSheet)}
                            {_renderListStyle(isSpreadsheet, STYLE_LIST_BIDS_ASK.spreadsheet)}
                            {_renderListStyle(isGrid, STYLE_LIST_BIDS_ASK.grid)}
                            {_renderListStyle(isColumns, STYLE_LIST_BIDS_ASK.columns)}
                            {_renderListStyle(isColumnsGap, STYLE_LIST_BIDS_ASK.columnsGap)}
                        </ul>
                    </div>
                </div>
                <div className="row align-items-stretch g-2">
                    <div className="col-md-9">
                        <div className="equal-target">
                            <div id="layout-1">
                                <div className="row align-items-stretch g-2">
                                    <div className="col-md-9">
                                        <OrderBookList styleListBidsAsk={listStyleBidsAsk} getTickerDetail={itemTickerDetail} getTicerLastQuote={assgnDataFormNewOrder} />
                                        <div className={`card card-ticker ${listStyleBidsAsk.columnsGap === true ? 'w-pr-135' : 'w-pr-100'}`}>
                                            <OrderBookTickerDetail getTickerDetail={itemTickerDetail} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card card-new-order d-flex flex-column h-100">
                                            <div className="card-header">
                                                <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                            </div>
                                            <div className="card-body">
                                                <OrderForm isOrderBook={true} currentTicker={currentTicker} messageSuccess={messageSuccess} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <OrderBookTradeHistory getDataTradeHistory={getDataTradeHistory} />
                    </div>
                </div>
            </div>
        </div>
    )

    return <>{_renderTemplateOrderBookCommon()}</>
};
export default OrderBookCommon;