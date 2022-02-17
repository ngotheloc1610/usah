import { useEffect, useState } from 'react';
import OrderForm from '../../../components/Order/OrderForm';
import OrderBookList from '../../../components/Orders/OrderBookCommon/OrderBookList';
import OrderBookTickerDetail from '../../../components/Orders/OrderBookCommon/OrderBookTickerDetail';
import OrderBookTradeHistory from '../../../components/Orders/OrderBookCommon/OrderBookTradeHistory';
import { STYLE_LIST_BIDS_ASK } from '../../../constants/order.constant';
import { IAskAndBidPrice, IStyleBidsAsk, ITickerInfo, ITradeHistory } from '../../../interfaces/order.interface';
import { ILastQuote } from '../../../interfaces/order.interface';
import * as pspb from "../../../models/proto/pricing_service_pb";
import * as rpcpb from '../../../models/proto/rpc_pb';
import { wsService } from "../../../services/websocket-service";
import './OrderBookCommon.scss';
import queryString from 'query-string';
import * as qspb from "../../../models/proto/query_service_pb";
import ReduxPersist from "../../../config/ReduxPersist";
import { SOCKET_CONNECTED, LIST_TICKER_INFO } from '../../../constants/general.constant';
import sendMsgSymbolList from '../../../Common/sendMsgSymbolList';
import { ITickerDetail } from '../../../interfaces/ticker.interface';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DEFAULT_CURRENT_TICKER, DEFAULT_DATA_TICKER, DEFAULT_TICKER_INFO } from '../../../mocks';

const OrderBookCommon = () => {
    const [isEarmarkSpreadSheet, setEarmarkSpreadSheet] = useState<boolean>(true);

    const [getDataTradeHistory, setGetDataTradeHistory] = useState<ITradeHistory[]>([]);
    const [isSpreadsheet, setSpreadsheet] = useState<boolean>(false);
    const [isGrid, setGrid] = useState<boolean>(false);
    const [isColumns, setColumns] = useState<boolean>(false);
    const [isColumnsGap, setColumnsGap] = useState<boolean>(false);
    const [currentTicker, setCurrentTicker] = useState<ITickerInfo | any>(DEFAULT_CURRENT_TICKER);
    const [msgSuccess, setMsgSuccess] = useState<string>('');
    const [symbolId, setSymbolId] = useState<number>(0);
    const [itemTickerInfor, setItemTickerInfor] = useState<ITickerDetail>(DEFAULT_TICKER_INFO);
    const [listTicker, setListTicker] = useState<ITickerDetail[]>(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]'))
    const [itemTickerDetail, setItemTickerDetail] = useState<ILastQuote>(DEFAULT_DATA_TICKER);
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([])

    const defaultData = () => {
        setEarmarkSpreadSheet(false);
        setSpreadsheet(false);
        setGrid(false);
        setColumns(false);
        setColumnsGap(false);
    }

    useEffect(() => searchTicker(), [itemTickerInfor])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList()
                sendMessage();
                getOrderBooks()
            }
        });

        const renderDataToScreen = wsService.getTradeHistory().subscribe(res => {
            setGetDataTradeHistory(res.tradeList)
        });

        const listSymbolCode: string[] = []
        listTicker.forEach((item: ITickerDetail) => {
            listSymbolCode.push(item.ticker);
        });
        setListSymbolCode(listSymbolCode)

        const getLastQuotesRes = wsService.getDataLastQuotes().subscribe(response => {
            const tickerDetail = response.quotesList.find((item: ILastQuote) => Number(item.symbolCode) === 1);
            setItemTickerDetail(tickerDetail)
        });

        return () => {
            ws.unsubscribe();
            renderDataToScreen.unsubscribe();
            getLastQuotesRes.unsubscribe();
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

    const handleDataFromWs = () => {
        wsService.getDataLastQuotes().subscribe(response => {
            const tickerDetail = response.quotesList.find((item: ILastQuote) => Number(item.symbolCode) === Number(symbolId));
            setItemTickerDetail(tickerDetail);
        });
    }

    const getOrderBooks = () => {
        const pricingServicePb: any = pspb;
        const rpc: any = rpcpb;
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let lastQuotesRequest = new pricingServicePb.GetLastQuotesRequest();
            listTicker.forEach(item => {
                lastQuotesRequest.addSymbolCode(item.symbolId.toString())
            });
            let rpcMsg = new rpc.RpcMessage();
            rpcMsg.setPayloadClass(rpc.RpcMessage.Payload.LAST_QUOTE_REQ);
            rpcMsg.setPayloadData(lastQuotesRequest.serializeBinary());
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

    const getTickerSearch = (value: string) => {
        const symbolCode = value !== undefined ? value : '';
        const itemTickerInfor = listTicker.find(item => item.ticker === symbolCode.toUpperCase());
        setItemTickerInfor(itemTickerInfor ? itemTickerInfor : DEFAULT_TICKER_INFO);
        setSymbolId(itemTickerInfor ? itemTickerInfor.symbolId : 0);
    }

    const searchTicker = () => {
        if (symbolId !== 0) {
            getOrderBooks();
            handleDataFromWs();
            return;
        }
        setItemTickerDetail(DEFAULT_DATA_TICKER);
    }

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            const itemTickerInfor = listTicker.find(item => item.ticker === (event.target.value).toUpperCase());
            setItemTickerInfor(itemTickerInfor ? itemTickerInfor : DEFAULT_TICKER_INFO);
            setSymbolId(itemTickerInfor ? itemTickerInfor.symbolId : 0);
            searchTicker()
        }
    }

    const assgnDataFormNewOrder = (item: IAskAndBidPrice) => {
        const assTickerInfor = itemTickerInfor;
        const itemTicker = {
            tickerName: assTickerInfor?.tickerName,
            ticker: assTickerInfor?.ticker,
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
                        onChange={(event: any) => getTickerSearch(event.target.innerText)}
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