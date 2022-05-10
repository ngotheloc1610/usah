import { useState, useEffect } from 'react'
import { IHistorySearchStatus } from '../../../interfaces/order.interface'
import * as tmpb from "../../../models/proto/trading_model_pb"
import * as smpb from '../../../models/proto/system_model_pb';
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import { wsService } from "../../../services/websocket-service";
import { ACCOUNT_ID, FORMAT_DATE, FROM_DATE_TIME, LIST_TICKER_INFO, MSG_CODE, MSG_TEXT, RESPONSE_RESULT, STATE, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp, getSymbolCode, removeFocusInput } from '../../../helper/utils';
import { ISymbolList } from '../../../interfaces/ticker.interface';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IParamHistorySearch } from '../../../interfaces';
import moment from 'moment';
import { DEFAULT_SEARCH_HISTORY } from '../../../mocks';

interface IPropsOrderSearchHistory {
    paramSearch: (param: IParamHistorySearch) => void;
}

function OrderHistorySearch(props: IPropsOrderSearchHistory) {
    const { paramSearch } = props;
    const [symbolCode, setSymbolCode] = useState('');
    const [orderState, setOrderState] = useState(0);
    const [orderSideBuy, setOrderSideBuy] = useState(false);
    const [orderSideSell, setOrderSideSell] = useState(false);
    const [side, setSide] = useState(0);
    const [fromDatetime, setFromDatetime] = useState(0);
    const [toDatetime, setToDatetime] = useState(0);
    const [listSymbolName, setListSymbolName] = useState<string[]>([]);
    const [currentDate, setCurrentDate] = useState('');
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');

    const [isErrorDate, setIsErrorDate] = useState(false);

    useEffect(() => {
        const currentDate = moment().format(FORMAT_DATE);
        setCurrentDate(currentDate);
        
        const paramSearchHistory: IParamHistorySearch = {
            symbolCode: symbolCode,
            orderState: orderState,
            orderSide: side,
            fromDate: convertDatetoTimeStamp(currentDate, FROM_DATE_TIME),
            toDate: convertDatetoTimeStamp(currentDate, TO_DATE_TIME),
        };
        setFromDatetime(convertDatetoTimeStamp(currentDate, FROM_DATE_TIME));
        setToDatetime(convertDatetoTimeStamp(currentDate, TO_DATE_TIME));
        paramSearch(paramSearchHistory);
    }, [])

    useEffect(() => getParamOrderSide(), [orderSideBuy, orderSideSell])

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
        const listSymbolName: string[] = []
        symbolsList.forEach((item: ISymbolList) => {
            listSymbolName.push(`${item.symbolCode} - ${item.symbolName}`);
        });
        setListSymbolName(listSymbolName)
    }, [])

    const handleChangeFromDate = (value: string) => {
        setFromDatetime(convertDatetoTimeStamp(value, FROM_DATE_TIME));
    }

    const handleChangeToDate = (value: string) => {
        setToDatetime(convertDatetoTimeStamp(value, TO_DATE_TIME));
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
        // before the core handles the filter but now the font end handle filter
        // sendMessageOrderHistory();
        fromDatetime > 0 && toDatetime > 0 && fromDatetime > toDatetime ? setIsErrorDate(true) : setIsErrorDate(false);
        const paramSearchHistory: IParamHistorySearch = {
            symbolCode: symbolCode,
            orderState: orderState,
            orderSide: side,
            fromDate: fromDatetime,
            toDate: toDatetime,
        }
        paramSearch(paramSearchHistory);
    }

    const handlKeyDown = (event: any) => {
        if (symbolCode !== '' || orderState !== 0 || side !== 0 || fromDatetime !== 0 || toDatetime !== 0) {
            if (event.key === 'Enter') {
                // before the core handles the filter but now the font end handle filter
                // sendMessageOrderHistory();
                const paramSearchHistory: IParamHistorySearch = {
                    symbolCode: symbolCode,
                    orderState: orderState,
                    orderSide: side,
                    fromDate: fromDatetime,
                    toDate: toDatetime,
                }
                paramSearch(paramSearchHistory);
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

    const handleOrderStatus = (value) => {
        setOrderState(parseInt(value));
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
            <select className="form-select form-select-sm input-select" onChange={(e) => handleOrderStatus(e.target.value)}>
                {STATE.map((item: IHistorySearchStatus) => (<option value={item.code} key={item.code}>{item.name}</option>))}
            </select>
        </div>
    )

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

    const btnClickFromDate = (e) => {
        handleChangeFromDate(e.target.value);
    }

    const btnClickToDate = (e) => {
        handleChangeToDate(e.target.value);
    }

    const _renderOrderSide = () => (
        <div className="col-xl-2 pl-30">
            <label htmlFor="Groups" className="d-block text-secondary mb-1"> Order Side</label>
            <div className="padding-top-5">

                <div className="form-check form-check-inline">
                    <input className="form-check-input input-select" type="checkbox" value="Sell" id="sell" onChange={(event) => setOrderSideSell(event.target.checked)} />
                    <label className="form-check-label" htmlFor="sell">Sell</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input input-select" type="checkbox" value="Buy" id="buy" onChange={(event) => setOrderSideBuy(event.target.checked)} />
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
                            value={fromDatetime ? moment(fromDatetime).format(FORMAT_DATE) : ''}
                            max="9999-12-31"
                            onChange={(event) => handleChangeFromDate(event.target.value)}
                        />
                    </div>
                </div>
                <div className='col-md-1 seperate'>~</div>
                <div className="col-md-5">
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm border-end-0 date-picker input-select"
                            value={toDatetime ? moment(toDatetime).format(FORMAT_DATE) : ''}
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
                <div className='row g-2 align-items-end'>
                    <div className="col-xs-7 col-sm-7 col-md-7 col-lg-7">
                    </div>
                    <div className="col-xs-5 col-sm-5 col-md-5 col-lg-5">
                        {isErrorDate && <div className='text-danger'>Period is incorrect, the to date must be greater than the from date</div>}
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
