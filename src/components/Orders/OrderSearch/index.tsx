import { useState, useEffect } from 'react'
import { IParamHistorySearch, IHistorySearchStatus } from '../../../interfaces/order.interface'
import { ORDER_HISTORY_SEARCH_STATUS } from '../../../mocks'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service";
import * as tmpb from "../../../models/proto/trading_model_pb"
import * as qspb from '../../../models/proto/query_service_pb'
import * as rspb from "../../../models/proto/rpc_pb";
import queryString from 'query-string';
import ReduxPersist from "../../../config/ReduxPersist"
import { OBJ_AUTHEN, SOCKET_CONNECTED } from '../../../constants/general.constant'


function OrderHistorySearch(props: any) {
    const { getDataFromOrderHistorySearch } = props

    const [ticker, setTicker] = useState('')
    const [orderState, setOrderState] = useState(0)
    const [orderBuy, setOrderBuy] = useState(false)
    const [orderSell, setOrderSell] = useState(false)
    const [orderType, setOrderType] = useState(0)
    const [fromDatetime, setFromDatetime] = useState('')
    const [toDatetime, setToDatetime] = useState('')
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])

    const dataParam: IParamHistorySearch = {
        ticker,
        orderState,
        orderType,
        fromDatetime,
        toDatetime
    }


    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessageSymbolList();;
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

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

    const sendMessageSymbolList = () => {
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


    const handleSearch = () => {
        getDataFromOrderHistorySearch(dataParam)
    }

    const _renderTicker = () => (
        <div className="col-xl-3">
            <label className="d-block text-secondary mb-1">Ticker</label>
            <select className="form-select form-select-sm" onChange={(event: any) => setTicker(event.target.value)}>
                <option value=''></option>
                {symbolList.map(item => <option value={item.symbolId} key={item.symbolId}>{item.symbolName} ({item.symbolCode})</option>)}
            </select>
        </div>
    )

    const _renderOrderStatus = () => (
        <div className="col-xl-2">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Status</label>
            <select className="form-select form-select-sm" onChange={(event: any) => setOrderState(parseInt(event.target.value))}>
                {ORDER_HISTORY_SEARCH_STATUS.map((item: IHistorySearchStatus) => (<option value={item.code} key={item.code}>{item.name}</option>))}
            </select>
        </div>
    )

    useEffect(() => getParamOrderSide(), [orderBuy, orderSell])

    const getParamOrderSide = () => {
        const tradingModelPb: any = tmpb
        if (orderSell === true && orderBuy === false) {
            setOrderType(tradingModelPb.OrderType.OP_SELL)
        }
        else if (orderSell === false && orderBuy === true) {
            setOrderType(tradingModelPb.OrderType.OP_BUY)
        }
        else {
            setOrderType(tradingModelPb.OrderType.ORDER_TYPE_NONE)
        }
    }

    const _renderOrderSide = () => (
        <div className="col-xl-2 pl-30">
            <label htmlFor="Groups" className="d-block text-secondary mb-1"> Order Side</label>
            <div className="padding-top-5">

                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" value="Sell" id="sell" onChange={(event: any) => setOrderSell(event.target.checked)} />
                    <label className="form-check-label" htmlFor="sell">Sell</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" value="Buy" id="buy" onChange={(event: any) => setOrderBuy(event.target.checked)} />
                    <label className="form-check-label" htmlFor="buy">Buy</label>
                </div>
            </div>
        </div>
    )
    const _renderDateTime = () => (
        <div className="col-xl-4">
            <label htmlFor="CreatDateTime" className="d-block text-secondary mb-1"> Datetime</label>
            <div className="row g-2">
                <div className="col-md-5">
                    <div className="input-group input-group-sm">
                        <input type="text" className="form-control form-control-sm border-end-0 date-picker" placeholder="MM/DD/YYYY"
                            value={fromDatetime}
                            onChange={(event) => setFromDatetime(event.target.value)}
                        />
                        <span className="input-group-text bg-white"><i className="bi bi-calendar"></i></span>
                    </div>
                </div>
                <div className='col-md-1 seperate'>~</div>
                <div className="col-md-5">
                    <div className="input-group input-group-sm">
                        <input type="text" className="form-control form-control-sm border-end-0 date-picker" placeholder="MM/DD/YYYY"
                            value={toDatetime}
                            onChange={(event) => setToDatetime(event.target.value)}
                        />
                        <span className="input-group-text bg-white"><i className="bi bi-calendar"></i></span>
                    </div>
                </div>
            </div>
        </div>
    )


    const _renderTemplate = () => (
        <>
            <div className="card-header">
                <h6 className="card-title fs-6 mb-0">Order History</h6>
            </div>
            <div className="card-body bg-gradient-light">
                <div className="row g-2 align-items-end">
                    {_renderTicker()}
                    {_renderOrderStatus()}
                    {_renderOrderSide()}
                    {_renderDateTime()}
                    <div className="col-xl-1 mb-2 mb-xl-0">
                        <a href="#" className="btn btn-sm d-block btn-primary" onClick={handleSearch}><strong>Search</strong></a>
                    </div>
                </div>
            </div>
        </>
    )

    return (
        <>
            {_renderTemplate()}
        </>
    )
}

export default OrderHistorySearch
