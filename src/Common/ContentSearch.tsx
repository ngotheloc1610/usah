import { useEffect, useState } from "react";
import { ACCOUNT_ID, LIST_TICKER_INFO, MSG_CODE, MSG_TEXT, RESPONSE_RESULT } from "../constants/general.constant";
import { ISymbolList } from "../interfaces/ticker.interface"
import { wsService } from "../services/websocket-service";
import * as tmpb from "../models/proto/trading_model_pb"
import * as qspb from "../models/proto/query_service_pb"
import * as rpcpb from "../models/proto/rpc_pb";
import * as smpb from '../models/proto/system_model_pb';
import { toast } from "react-toastify";
import { getSymbolCode, removeFocusInput } from "../helper/utils";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

interface IPropsContentSearch {
    getParamSearch: ( symbolCode: string, orderSide: number) => void;
}

const ContentSearch = (props: IPropsContentSearch) => {
    const { getParamSearch } = props;
    const [symbolCode, setSymbolCode] = useState('');
    const [orderSideBuy, setOrderSideBuy] = useState(false);
    const [orderSideSell, setOrderSideSell] = useState(false);
    const [side, setSide] = useState(0);
    const [listSymbolName, setListSymbolName] = useState<string[]>([]);
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');

    useEffect(() => getParamOrderSide(), [orderSideBuy, orderSideSell])

    useEffect(() => {
        const listSymbolName: string[] = []
        symbolsList.forEach((item: ISymbolList) => {
            listSymbolName.push(`${item.symbolCode} - ${item.symbolName}`);
        });
        setListSymbolName(listSymbolName)
    }, [])

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
            setSide(tradingModelPb.Side.SELL);
        }
        else if (orderSideSell === false && orderSideBuy === true) {
            setSide(tradingModelPb.Side.BUY);
        }
        else {
            setSide(tradingModelPb.Side.NONE);
        }
    }

    const sendMessageSearch = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();

            orderRequest.setAccountId(Number(accountId));
            // Filter đang chưa có nên tạm thời chưa gửi symbolCode và side lên và sẽ tự lọc tránh lỗi
            // orderRequest.setSymbolCode(symbolCode);
            // orderRequest.setSide(side);

            rpcMsg.setPayloadData(orderRequest.serializeBinary());
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const handleSearch = () => {
        // Filter hiện đang do bên Front End làm nên tạm thời không gửi msg Request lên
        // sendMessageSearch();
        getParamSearch(symbolCode, side);
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const getListOrderResponse = (value: number, content: string) => (
        (value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)
    )

    const handleChangeTicker = (value: string) => {
        value ? setSymbolCode(getSymbolCode(value)) : setSymbolCode('');
    }

    const handleKeyUp = (value: string) => {
        value ? setSymbolCode(getSymbolCode(value)) : setSymbolCode('');
    }


    const _renderTicker = () => (
        <div className=" col-xl-3">
            <label className="d-block text-secondary mb-1">Ticker</label>
            <Autocomplete
                className='ticker-input'
                onChange={(event: any) => handleChangeTicker(event.target.innerText)}
                onKeyUp={(event: any) => handleKeyUp(event.target.value)}
                disablePortal
                options={listSymbolName}
                renderInput={(params) => <TextField {...params} placeholder="Search" />}
            />
        </div>
    )

    const _renderOrderSide = () => (
        <div className="col-xl-2 pl-30">
            <label className="d-block text-secondary mb-1"> Order Side</label>
            <div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input input-select" type="checkbox" id="sell" value="sell" onChange={(event) => setOrderSideSell(event.target.checked)} />
                    <label className="form-check-label">Sell</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input input-select" type="checkbox" id="buy" value="buy" onChange={(event) => setOrderSideBuy(event.target.checked)} />
                    <label className="form-check-label">Buy</label>
                </div>
            </div>

        </div>
    )

    const _renderTemplate = () => (
        <div>
            <div className="card-body bg-gradient-light mb-3">
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