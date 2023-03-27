import { useState, useEffect } from 'react'
import { wsService } from "../../../services/websocket-service";
import * as tmpb from "../../../models/proto/trading_model_pb";
import * as smpb from '../../../models/proto/system_model_pb';
import '../OrderHistory/orderHistory.scss'
import { convertDatetoTimeStamp, convertNumber, getSymbolCode } from '../../../helper/utils';
import { FORMAT_DATE, FROM_DATE_TIME, LIST_TICKER_INFO, MSG_CODE, MSG_TEXT, ORDER_TYPE_SEARCH, RESPONSE_RESULT, TO_DATE_TIME } from '../../../constants/general.constant';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import moment from 'moment';
import { IParamSearchTradeHistory, IPropsSearchTradeHistory } from '../../../interfaces/order.interface';

function SearchTradeHistory(props: IPropsSearchTradeHistory) {
    const tradingModelPb: any = tmpb;
    const { getParamSearch, handleDownload } = props
    const [symbolCode, setSymbolCode] = useState('')
    const [orderSideBuy, setOrderSideBuy] = useState(false);
    const [orderSideSell, setOrderSideSell] = useState(false);
    const [side, setSide] = useState(0);
    const [fromDatetime, setDateTimeFrom] = useState(0);
    const [toDatetime, setDateTimeTo] = useState(0);
    const [listSymbolName, setListSymbolName] = useState<string[]>([]);
    const [isErrorDate, setIsErrorDate] = useState(false);
    const [orderType, setOrderType] = useState(tradingModelPb.OrderType.OP_NONE);
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');

    useEffect(() => {
        const currentDate = moment().format(FORMAT_DATE);
        setDateTimeFrom(convertDatetoTimeStamp(currentDate, FROM_DATE_TIME));
        setDateTimeTo(convertDatetoTimeStamp(currentDate, TO_DATE_TIME));
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => getParamOrderSide(), [orderSideBuy, orderSideSell])

    useEffect(() => {
        const systemModelPb: any = smpb;
        const tradeHistoryRes = wsService.getTradeHistory().subscribe(res => {
            let tmp = 0;
            if (res[MSG_CODE] !== systemModelPb.MsgCode.MT_RET_OK) {
                tmp = RESPONSE_RESULT.error;
            }
            getTradeHistoryResponse(tmp, res[MSG_TEXT]);
        });

        return () => tradeHistoryRes.unsubscribe()
    }, [])

    useEffect(() => {
        const listSymbolName: string[] = [];
        symbolsList.forEach(item => {
            listSymbolName.push(`${item.symbolCode} - ${item.symbolName}`);
        });
        setListSymbolName(listSymbolName)
    }, [])

    const handleChangeFromDate = (value: string) => {
        setDateTimeFrom(convertDatetoTimeStamp(value, FROM_DATE_TIME))
    }

    const handleChangeToDate = (value: string) => {
        setDateTimeTo(convertDatetoTimeStamp(value, TO_DATE_TIME))
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const getTradeHistoryResponse = (value: number, content: string) => (
        <>
            {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
        </>
    )

    const handleSearch = () => {
        fromDatetime > toDatetime ? setIsErrorDate(true) : setIsErrorDate(false);
        const param: IParamSearchTradeHistory = {
            side: side,
            symbolCode: symbolCode,
            fromDate: fromDatetime,
            toDate: toDatetime,
            orderType: orderType
        }
        getParamSearch(param);
    }

    const getParamOrderSide = () => {
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

    const handleChangeTicker = (value: string) => {
        value ? setSymbolCode(getSymbolCode(value)) : setSymbolCode('');
    }

    const handleKeyUp = (value: string) => {
        value ? setSymbolCode(getSymbolCode(value)) : setSymbolCode('');
    }

    const _renderTicker = () => (
        <div className="col-xl-3">
            <label className="d-block text-secondary mb-1">Ticker Code</label>
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

    const handleOrderType = (value) => {
        setOrderType(convertNumber(value));
    }

    const _renderListOrderType = () => {
        return ORDER_TYPE_SEARCH.map((item, index) => (<option value={item.code} key={index}>{item.name}</option>))
    }

    const _renderOrderType = () => (
        <div className="col-xl-1">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Type</label>
            <select className="form-select form-select-sm input-select" onChange={(e) => handleOrderType(e.target.value)}>
                {_renderListOrderType()}
            </select>
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
                <h6 className="card-title fs-6 mb-0">Trade History</h6>
            </div>
            <div className="card-body bg-gradient-light">
                <div className="row g-2 align-items-end">
                    {_renderTicker()}
                    {_renderOrderType()}
                    {_renderOrderSide()}
                    {_renderDateTime()}
                     <div className="col-xl-2 mb-2 mb-xl-0 d-flex justify-content-between">
                        <a href="#" className="btn btn-primary text-white ps-3 pe-3" onClick={handleSearch}><i className="bi bi-search"></i> Search</a>
                        <a className="btn btn-success text-white ps- pe-3" onClick={() => handleDownload(true)}><i className="bi bi-cloud-download"></i> Download</a>
                    </div>
                </div>
                <div className='row g-2 align-items-end'>
                    <div className="col-xl-5 ">
                    </div>
                    <div className="col-xl-5 ">
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

export default SearchTradeHistory