import { useEffect, useState } from "react";
import { MSG_CODE, MSG_TEXT, OBJ_AUTHEN, RESPONSE_RESULT, SOCKET_CONNECTED } from "../constants/general.constant";
import { ISymbolList } from "../interfaces/ticker.interface"
import { wsService } from "../services/websocket-service";
import * as tmpb from "../models/proto/trading_model_pb"
import * as qspb from "../models/proto/query_service_pb"
import * as rpcpb from "../models/proto/rpc_pb";
import * as smpb from '../models/proto/system_model_pb';
import sendMsgSymbolList from "./sendMsgSymbolList";
import queryString from 'query-string';
import ReduxPersist from "../config/ReduxPersist";
import { toast } from "react-toastify";

const ContentSearch = () => {
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])
    const [ticker, setTicker] = useState('')
    const [orderSideBuy, setOrderSideBuy] = useState(false)
    const [orderSideSell, setOrderSideSell] = useState(false)
    const [orderType, setOrderType] = useState(0)

    useEffect(() => getParamOrderSide(), [orderSideBuy, orderSideSell])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
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

    useEffect(() => sendMessageSearch(), [ticker, orderType])


    useEffect(() => {
        const systemModelPb: any = smpb;
        const listOrder = wsService.getListOrder().subscribe(res => {
            let tmp = 0;
            if (res[MSG_CODE] !== systemModelPb.MsgCode.MT_RET_OK) {
                tmp = RESPONSE_RESULT.error;
            }
            getListOrderResponse(tmp, res[MSG_TEXT]);
        });

        return () => listOrder.unsubscribe()
    }, [])

    const getParamOrderSide = () => {
        const tradingModelPb: any = tmpb
        if (orderSideSell === true && orderSideBuy === false) {
            setOrderType(tradingModelPb.OrderType.OP_SELL_LIMIT)
        }
        else if (orderSideSell === false && orderSideBuy === true) {
            setOrderType(tradingModelPb.OrderType.OP_BUY_LIMIT)
        }
        else {
            setOrderType(tradingModelPb.OrderType.ORDER_TYPE_NONE)
        }
    }

    const sendMessageSearch = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessage(accountId);
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                buildMessage(accountId);
                return;
            }
        });
    }

    const buildMessage = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();

            orderRequest.setAccountId(Number(accountId));
            orderRequest.setSymbolCode(ticker)

            rpcMsg.setPayloadData(orderRequest.serializeBinary());
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleSearch = () => {
        sendMessageSearch()
    }

    const handlKeyDown = (event: any) => {
        if (ticker !== '' || orderType !== 0) {
            if (event.key === 'Enter') {
                sendMessageSearch()
            }
        }
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const getListOrderResponse = (value: number, content: string) => (
        (value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)
    )

    const _renderTicker = () => (
        <div className=" col-xl-3">
            <label className="d-block text-secondary mb-1">Ticker</label>
            <select className="form-select form-select-sm"
                onChange={(event: any) => setTicker(event.target.value)}
            >
                <option value=''></option>
                {symbolList.map((item: ISymbolList) => <option value={item.symbolId} key={item.symbolId}>{item.symbolName} ({item.symbolCode})</option>)}
            </select>
        </div>
    )

    const _renderOrderSide = () => (
        <div className="col-xl-2 pl-30">
            <label className="d-block text-secondary mb-1"> Order Side</label>
            <div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="sell" value="sell" onChange={(event) => setOrderSideSell(event.target.checked)} />
                    <label className="form-check-label">Sell</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="buy" value="buy" onChange={(event) => setOrderSideBuy(event.target.checked)} />
                    <label className="form-check-label">Buy</label>
                </div>
            </div>

        </div>
    )

    const _renderTemplate = () => (
        <div>
            <div className="card-body bg-gradient-light mb-3" onKeyDown={handlKeyDown}>
                <div className="row g-2 align-items-end">
                    {_renderTicker()}
                    {_renderOrderSide()}
                    <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2">
                        <a href="#" className="btn btn-sm d-block btn-primary text-nowrap" onClick={handleSearch}><strong>Search</strong></a>
                    </div>
                </div>
            </div>
        </div>
    )

    return _renderTemplate()


}
export default ContentSearch