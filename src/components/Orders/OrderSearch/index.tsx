import React, { useState, useEffect, useRef, useMemo } from 'react'
import { IDataOrderHistory, IHistorySearchStatus } from '../../../interfaces/order.interface'
import * as tmpb from "../../../models/proto/trading_model_pb"
import * as smpb from '../../../models/proto/system_model_pb';
import { wsService } from "../../../services/websocket-service";
import { ACCOUNT_ID, FORMAT_DATE, FROM_DATE_TIME, LIST_TICKER_INFO, MSG_CODE, MSG_TEXT, ORDER_TYPE_SEARCH, RESPONSE_RESULT, 
    START_PAGE, 
    STATE_HISTORY_SEARCH, TEAM_CODE, TO_DATE_TIME } from '../../../constants/general.constant';
import { convertDatetoTimeStamp, convertNumber, defindConfigPost, getSymbolCode } from '../../../helper/utils';
import { ISymbolList } from '../../../interfaces/ticker.interface';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IAccountID, IParamOrderHistory } from '../../../interfaces';
import moment from 'moment';
import axios from 'axios';
import { success } from '../../../constants';
import { API_GET_ACCOUNT_BY_TEAM_CODE } from '../../../constants/api.constant';
interface IPropsOrderSearchHistory {
    resetFlagSearch: (isSearch: boolean) => void;
    handleDownLoad: (isDownload: boolean) => void;
    paramHistorySearch: IParamOrderHistory;
    isErrorAccountId: boolean;
    setParamHistorySearch: (param: IParamOrderHistory) => void;
    resetListOrder: (param: IDataOrderHistory[]) => void;
}

function OrderHistorySearch(props: IPropsOrderSearchHistory) {
    const { resetFlagSearch, handleDownLoad, paramHistorySearch, setParamHistorySearch, isErrorAccountId, resetListOrder } = props;

    const tradingModelPb: any = tmpb;
    const api_url = window.globalThis.apiUrl;

    const [symbolCode, setSymbolCode] = useState('');
    const [orderState, setOrderState] = useState(0);
    const [orderType, setOrderType] = useState(tradingModelPb.OrderType.OP_NONE);
    const [orderSideBuy, setOrderSideBuy] = useState(false);
    const [orderSideSell, setOrderSideSell] = useState(false);
    const [side, setSide] = useState(0);
    const [fromDatetime, setFromDatetime] = useState(0);
    const [toDatetime, setToDatetime] = useState(0);
    const [listSymbolName, setListSymbolName] = useState<string[]>([]);
    const [isErrorDate, setIsErrorDate] = useState(false);
    const [accountId, setAccountId] = useState(localStorage.getItem(ACCOUNT_ID) || '');
    const [listAccountId, setListAccountId] = useState<IAccountID[]>([]);
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const teamCode = localStorage.getItem(TEAM_CODE) || '';
    
    const defaultAccountId = useMemo(() => {
        return {
            label: accountId,
            value: accountId
        }
    }, [accountId])

    const prevParamSearch = useRef<IParamOrderHistory>();

    useEffect(() => {
        const urlGetAccountId = `${api_url}${API_GET_ACCOUNT_BY_TEAM_CODE}`;

        axios.post(urlGetAccountId, {}, defindConfigPost()).then(resp => {
            if(resp.status === success) {
                const listAccId = resp.data.data;
                const tmpList: IAccountID[] = [];
                listAccId.forEach(item => {
                    tmpList.push({
                        value: item.account_id,
                        label: item.account_id
                    })
                })
                setListAccountId(tmpList);
            }
        })
    }, [])

    useEffect(() => {
        prevParamSearch.current = paramHistorySearch;
    }, [paramHistorySearch]);

    useEffect(() => {
        const currentDate = moment().format(FORMAT_DATE);
        setFromDatetime(convertDatetoTimeStamp(currentDate, FROM_DATE_TIME));
        setToDatetime(convertDatetoTimeStamp(currentDate, TO_DATE_TIME));
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const listSymbolName: string[] = []
        symbolsList.forEach((item: ISymbolList) => {
            listSymbolName.push(`${item.symbolCode} - ${item.symbolName}`);
        });
        setListSymbolName(listSymbolName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleChangeFromDate = (value: string) => {
        setFromDatetime(convertDatetoTimeStamp(value, FROM_DATE_TIME));
    }

    const handleChangeToDate = (value: string) => {
        setToDatetime(convertDatetoTimeStamp(value, TO_DATE_TIME));
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
        // In case from/to time is not selected (clear)
        // value will be current date time
        const currentDate = moment().format(FORMAT_DATE);
        const fromTime = fromDatetime || convertDatetoTimeStamp(currentDate, FROM_DATE_TIME)
        const toTime = toDatetime || convertDatetoTimeStamp(currentDate, TO_DATE_TIME)
        
        if(fromTime > toTime){
            setIsErrorDate(true);
            resetListOrder([]);
        } else {
            setIsErrorDate(false);
            const paramSearchHistory: IParamOrderHistory = {
                ...paramHistorySearch,
                page: START_PAGE,
                symbol_code: symbolCode,
                order_state: orderState,
                order_side: side,
                from_time: fromTime,
                to_time: toTime,
                order_type: orderType,
                account_id: accountId
            }
            // avoid re-search when params dont change
            const prevParam = prevParamSearch.current;
            const currentParam = paramSearchHistory;
            if(JSON.stringify(prevParam) === JSON.stringify(currentParam)) return;
    
            setParamHistorySearch(paramSearchHistory);
            resetFlagSearch(true);
        }
    }

    const handleChangeAccountId = (event:any , values: any) => {
        values ? setAccountId(values.value) : setAccountId('*');
    }

    const handleKeyUpAccountId = (event:any) => {
        event.target.value ? setAccountId(event.target.value) : setAccountId('');
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

    const handleOrderType = (value) => {
        setOrderType(convertNumber(value));
    }

    const _renderListOrderState = () => {
        return STATE_HISTORY_SEARCH.map((item: IHistorySearchStatus) => (<option value={item.code} key={item.code}>{item.name}</option>))
    }

    const _renderListOrderType = () => {
        return ORDER_TYPE_SEARCH.map((item, index) => (<option value={item.code} key={index}>{item.name}</option>))
    }

    const _renderAccountId = () => (
        <div className="col-xl-3 pe-xl-0 ps-xl-1">
            <label className="d-block text-secondary mb-1">Account Id</label>
            <Autocomplete
                className='account-input'
                options={listAccountId}
                onChange={handleChangeAccountId}
                onKeyUp={handleKeyUpAccountId}
                disablePortal
                defaultValue={defaultAccountId}
                value={defaultAccountId}
                getOptionLabel={(option) => option.value === "*" ? "" : option.value}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => <TextField {...params} placeholder="Search"/>}
            />  
        </div>
    )

    const _renderTicker = () => (
        <div className={`${teamCode !== "null" ? "col-xl-6" : "col-xl-9"}`}>
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
        <div className="col-xl-3 p-xl-0 ">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Status</label>
            <select className="form-select form-select-sm input-select" onChange={(e) => handleOrderStatus(e.target.value)}>
                {_renderListOrderState()}
            </select>
        </div>
    )

    const _renderOrderType = () => (
        <div className="col-xl-3 pe-xl-0">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Type</label>
            <select className="form-select form-select-sm input-select" onChange={(e) => handleOrderType(e.target.value)}>
                {_renderListOrderType()}
            </select>
        </div>
    )

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

    const _renderOrderSide = () => (
        <div className="col-xl-4 pe-lg-0 c">
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
        <div className="col-xl-5 ps-xl-0 pe-xl-0">
            <label htmlFor="CreatDateTime" className="d-block text-secondary mb-1"> Datetime</label>
            <div className="row g-2">
                <div className="col-md-6">
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm date-picker input-select"
                            value={fromDatetime ? moment(fromDatetime).format(FORMAT_DATE) : ''}
                            max="9999-12-31"
                            onChange={(event) => handleChangeFromDate(event.target.value)}
                        />
                    </div>
                </div>
                {/* <div className='col-md-2 seperate'>~</div> */}
                <div className="col-md-6">
                    <div className="input-group input-group-sm">
                        <input type="date" className="form-control form-control-sm date-picker input-select"
                            value={toDatetime ? moment(toDatetime).format(FORMAT_DATE) : ''}
                            max="9999-12-31"
                            onChange={(event) => handleChangeToDate(event.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const downLoadOrderHistory = () => {
        if (handleDownLoad != null) {
            handleDownLoad(true);
        }
    }


    const _renderTemplate = () => (
        <>
            <div className="card-header">
                <h6 className="card-title fs-6 mb-0">Order History</h6>
            </div>
            <div className="card-body bg-gradient-light">
                <div className="row g-2 d-flex align-items-end me-0">
                    <div className="row col-xxl-5 col-xl-6 pe-xl-0">
                        {teamCode !== "null" && _renderAccountId()}
                        {_renderTicker()}
                        {_renderOrderStatus()}
                    </div>
                    <div className='row col-xxl-5 col-xl-6 ms-xl-3 pe-xl-0'>
                        {_renderOrderType()}
                        {_renderOrderSide()}
                        {_renderDateTime()}
                    </div>
                    <div className="col-xxl-2 col-xl-4 mb-2 mb-xl-0 ms-3 d-flex justify-content-xl-end ms-xl-auto ps-0">
                        <a className="btn btn-primary text-white me-2" onClick={handleSearch}><i className="bi bi-search"></i> Search</a>
                        <a className="btn btn-success text-white" onClick={downLoadOrderHistory}><i className="bi bi-cloud-download"></i> Download</a>
                    </div>
                </div>
                <div className='row g-2 align-items-end'>
                    <div className="col-xs-7 col-sm-7 col-md-7 col-lg-7">
                        {isErrorAccountId && <div className='text-danger'>Sorry. You have no rights to view Order History of this account</div>}
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

export default React.memo(OrderHistorySearch)
