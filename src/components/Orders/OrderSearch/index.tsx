import { useState, useEffect } from 'react'
import { IHistorySearchStatus } from '../../../interfaces/order.interface'
import { ORDER_HISTORY_SEARCH_STATUS } from '../../../mocks'
import * as tmpb from "../../../models/proto/trading_model_pb"
import * as smpb from '../../../models/proto/system_model_pb';
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import { wsService } from "../../../services/websocket-service";
import { ACCOUNT_ID, FROM_DATE_TIME, LIST_TICKER_INFO, MSG_CODE, MSG_TEXT, RESPONSE_RESULT, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp, getSymbolCode, removeFocusInput } from '../../../helper/utils';
import { ISymbolList } from '../../../interfaces/ticker.interface';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

interface IPropsOrderSearchHistory {
    getOrderSide: (item: number) => void;
}

function OrderHistorySearch(props: IPropsOrderSearchHistory) {
    const { getOrderSide } = props;
    const [symbolCode, setSymbolCode] = useState('');
    const [orderState, setOrderState] = useState(0);
    const [orderBuy, setOrderBuy] = useState(false);
    const [orderSell, setOrderSell] = useState(false);
    const [side, setSide] = useState(0);
    const [fromDatetime, setFromDatetime] = useState(0);
    const [toDatetime, setToDatetime] = useState(0);
    const [listSymbolName, setListSymbolName] = useState<string[]>([]);
    const [currentDate, setCurrentDate] = useState('');
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');

    useEffect(() => getParamOrderSide(), [orderBuy, orderSell])

    useEffect(() => {
        const systemModelPb: any = smpb;
        const orderHistoryRes = wsService.getListOrderHistory().subscribe(res => {
            let tmp = 0;
            if (res[MSG_CODE] !== systemModelPb.MsgCode.MT_RET_OK) {
                tmp = RESPONSE_RESULT.error;
            }
            getOrderHistoryResponse(tmp, res[MSG_TEXT]);
        });

        return () => orderHistoryRes.unsubscribe()
    }, [])

    useEffect(() => {
        const today: number = new Date().getDate();
        let currentDate = '';
        if (today > 0 && today < 10) {
            currentDate = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-0${new Date().getDate()}`;
        } else {
            currentDate = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-${new Date().getDate()}`;
        }
        setCurrentDate(currentDate);
        setFromDatetime(convertDatetoTimeStamp(currentDate, FROM_DATE_TIME));
        setToDatetime(convertDatetoTimeStamp(currentDate, TO_DATE_TIME));
    }, [])

    useEffect(() => {
            const listSymbolName: string[] = []
            symbolsList.forEach((item: ISymbolList) => {
                listSymbolName.push(`${item.symbolCode} - ${item.symbolName}`);
            });
            setListSymbolName(listSymbolName)
    }, [])

    const handleChangeFromDate = (value: string) => {
        setFromDatetime(convertDatetoTimeStamp(value, FROM_DATE_TIME))
    }

    const handleChangeToDate = (value: string) => {
        setToDatetime(convertDatetoTimeStamp(value, TO_DATE_TIME))
    }

    const sendMessageOrderHistory = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderHistoryRequest = new queryServicePb.GetOrderHistoryRequest();

            orderHistoryRequest.setAccountId(Number(accountId));
            orderHistoryRequest.setSymbolCode(symbolCode);
            orderHistoryRequest.setSide(side);
            orderHistoryRequest.setFromDatetime(fromDatetime);
            orderHistoryRequest.setToDatetime(toDatetime);
            orderHistoryRequest.setOrderState(orderState);

            const rpcModel: any = rpcpb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_HISTORY_REQ);
            rpcMsg.setPayloadData(orderHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const getOrderHistoryResponse = (value: number, content: string) => (
        <>
            {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
        </>
    )

    const handleSearch = () => {
        sendMessageOrderHistory();
        getOrderSide(side);
    }

    const handlKeyDown = (event: any) => {
        if (symbolCode !== '' || orderState !== 0 || side !== 0 || fromDatetime !== 0 || toDatetime !== 0) {
            if (event.key === 'Enter') {
                sendMessageOrderHistory();
                getOrderSide(side);
                const el: any = document.querySelectorAll('.input-select');
                removeFocusInput(el);
            }
        }
    }

    const handleChangeTicker = (value: string) => {
        value ? setSymbolCode(getSymbolCode(value)) : setSymbolCode('');
    }

    const handleKeyUp = (value: string) => {
        value ? setSymbolCode(getSymbolCode(value)) : setSymbolCode('');
    }

    const _renderTicker = () => (
        <div className="col-xl-3">
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

    const _renderOrderStatus = () => (
        <div className="col-xl-2">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Status</label>
            <select className="form-select form-select-sm input-select" onChange={(e) => setOrderState(parseInt(e.target.value))}>
                {ORDER_HISTORY_SEARCH_STATUS.map((item: IHistorySearchStatus) => (<option value={item.code} key={item.code}>{item.name}</option>))}
            </select>
        </div>
    )

    const getParamOrderSide = () => {
        const tradingModelPb: any = tmpb
        if (orderSell === true && orderBuy === false) {
            setSide(tradingModelPb.Side.SELL)
        }
        else if (orderSell === false && orderBuy === true) {
            setSide(tradingModelPb.Side.BUY)
        }
        else {
            setSide(tradingModelPb.Side.NONE)
        }
    }

    const _renderOrderSide = () => (
        <div className="col-xl-2 pl-30">
            <label htmlFor="Groups" className="d-block text-secondary mb-1"> Order Side</label>
            <div className="padding-top-5">

                <div className="form-check form-check-inline">
                    <input className="form-check-input input-select" type="checkbox" value="Sell" id="sell" onChange={(e) => setOrderSell(e.target.checked)} />
                    <label className="form-check-label" htmlFor="sell">Sell</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input input-select" type="checkbox" value="Buy" id="buy" onChange={(e) => setOrderBuy(e.target.checked)} />
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
                        <input type="date" className="form-control form-control-sm border-end-0 date-picker input-select"
                            defaultValue={currentDate}
                            max="9999-12-31"
                            onChange={(event) => handleChangeFromDate(event.target.value)}
                        />
                    </div>
                </div>
                <div className='col-md-1 seperate'>~</div>
                <div className="col-md-5">
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm border-end-0 date-picker input-select"
                            defaultValue={currentDate}
                            max="9999-12-31"
                            onChange={(event) => handleChangeToDate(event.target.value)}
                        />
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
            <div className="card-body bg-gradient-light" onKeyDown={handlKeyDown}>
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
