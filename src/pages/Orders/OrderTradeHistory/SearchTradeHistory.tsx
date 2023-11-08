import { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import moment from 'moment';

import * as tmpb from "../../../models/proto/trading_model_pb";
import { convertDatetoTimeStamp, convertNumber, getSymbolCode,  } from '../../../helper/utils';
import { FORMAT_DATE, FROM_DATE_TIME, LIST_TICKER_INFO, ORDER_TYPE_SEARCH, TO_DATE_TIME, ACCOUNT_ID, DEFAULT_TIMESTAMP_GET_ALL } from '../../../constants/general.constant';
import { IParamSearchComponentTradeHistory, IPropsSearchTradeHistory} from '../../../interfaces/order.interface';

import useFetchApiAccount from '../../../customsHook/useFetchApiAccount';
import '../OrderHistory/orderHistory.scss'

function SearchTradeHistory(props: IPropsSearchTradeHistory) {
    const tradingModelPb: any = tmpb;
    const { getParamSearch, handleDownload, isUnAuthorised } = props
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
    const currentAccountId = sessionStorage.getItem(ACCOUNT_ID) || '';
    const [accountId, setAccountId] = useState(currentAccountId);
    
    const {listAccId, isShowAccountId} = useFetchApiAccount();

    useEffect(() => {
        const currentDate = moment().format(FORMAT_DATE);
        setDateTimeFrom(convertDatetoTimeStamp(currentDate, FROM_DATE_TIME));
        setDateTimeTo(convertDatetoTimeStamp(currentDate, TO_DATE_TIME));
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => getParamOrderSide(), [orderSideBuy, orderSideSell])

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

    const handleSearch = () => {
          // In case from/to time is not selected (clear)
        // fromTime -> get all order history in past
        // toTime -> get current date  
        const currentDate = moment().format(FORMAT_DATE);
        const fromTime = fromDatetime ? fromDatetime : DEFAULT_TIMESTAMP_GET_ALL
        const toTime = toDatetime || convertDatetoTimeStamp(currentDate, TO_DATE_TIME)
        fromTime > toTime ? setIsErrorDate(true) : setIsErrorDate(false);
        const param: IParamSearchComponentTradeHistory= {
            order_side: side,
            symbol_code: symbolCode,
            from_time: fromTime,
            to_time: toTime,
            order_type: orderType,
            account_id: accountId
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
        <div className= {`${isShowAccountId ? 'col-xl-6 ps-0 pe-2' : 'col-xl-3'}`}>
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
        <div className={`${isShowAccountId ? 'col-xl-5 ps-1 pe-0' : 'col-xl-2 pl-30'}`}>
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
        <div className={`${isShowAccountId ? 'col-xl-3' : 'col-xl-1'} ps-0 pe-2`}>
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Type</label>
            <select className="form-select form-select-sm input-select" onChange={(e) => handleOrderType(e.target.value)}>
                {_renderListOrderType()}
            </select>
        </div>
    )

    const _renderDateTime = () => (
        <div className={`${isShowAccountId ? 'col-xl-7' : 'col-xl-4'} px-0`}>
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
    const handleChangeAccountId = (event:any , values: any) => {
        values ? setAccountId(values) : setAccountId('*');
    }

    const handleKeyUpAccountId = (event:any) => {
        event.target.value ? setAccountId(event.target.value) : setAccountId('');
    }

    const _renderAccId = () => (
        <div className='col-xl-3 ps-1 pe-2'>
            <label className="d-block text-secondary mb-1">Account Id</label>
            <Autocomplete
                className='account-input'
                options={listAccId}
                onChange={handleChangeAccountId}
                onKeyUp={handleKeyUpAccountId}
                disablePortal
                defaultValue={currentAccountId}
                value={accountId}
                getOptionLabel={(option) => option === "*" ? "" : option}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => <TextField {...params} placeholder="Search"/>}
            />
        </div>
    )

    const _renderTemplate = () => (
        <>
            <div className="card-header">
                <h6 className="card-title fs-6 mb-0">Trade History</h6>
            </div>
            <div className="card-body bg-gradient-light">
                {isShowAccountId ? (
                    <div className="row g-2 align-items-end">
                        <div className='row col-xl-6'>
                            {_renderAccId()}
                            {_renderTicker()}
                            {_renderOrderType()}
                        </div>
                        <div className='row col-xl-4'>
                            {_renderOrderSide()}
                            {_renderDateTime()}
                        </div>
                        <div className="col-xl-2 mb-2 mb-xl-0 d-flex justify-content-between ms-2">
                            <a href="#" className="btn btn-primary text-white ps-3 pe-3" onClick={handleSearch}><i className="bi bi-search"></i> Search</a>
                            <a className="btn btn-success text-white ps- pe-3" onClick={() => handleDownload(true)}><i className="bi bi-cloud-download"></i> Download</a>
                        </div>
                    </div>

                ) : (
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

                )}
                <div className='row g-2 align-items-end'>
                    <div className="col-xl-5 ">
                        {isUnAuthorised && <div className='text-danger'>Sorry. You have no rights to view Trade History of this account</div>}
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