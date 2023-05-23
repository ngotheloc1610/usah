import React, { useEffect, useState } from "react";
import { ACCOUNT_ID, LIST_TICKER_INFO, MSG_CODE, MSG_TEXT, ORDER_TYPE_SEARCH, RESPONSE_RESULT } from "../constants/general.constant";
import { ISymbolList } from "../interfaces/ticker.interface"
import { wsService } from "../services/websocket-service";
import * as tmpb from "../models/proto/trading_model_pb"
import * as smpb from '../models/proto/system_model_pb';
import { toast } from "react-toastify";
import { convertNumber, getSymbolCode } from "../helper/utils";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IParamSearchPendingOrder } from "../interfaces";
import useFetchApiAccount from "../customsHook/useFetchApiAccount";

interface IPropsContentSearch {
    getParamSearch: (param: IParamSearchPendingOrder) => void;
    isUnAuthorised: boolean;
}

const ContentSearch = (props: IPropsContentSearch) => {
    const { getParamSearch, isUnAuthorised } = props;

    const tradingModelPb: any = tmpb;
    
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const currentAccount = localStorage.getItem(ACCOUNT_ID) || '';

    const [symbolCode, setSymbolCode] = useState('');
    const [orderSideBuy, setOrderSideBuy] = useState(false);
    const [orderSideSell, setOrderSideSell] = useState(false);
    const [side, setSide] = useState(0);
    const [orderType, setOrderType] = useState(tradingModelPb.OrderType.OP_NONE);
    const [listSymbolName, setListSymbolName] = useState<string[]>([]);
    const [accountId, setAccountId] = useState(currentAccount);

    const {listAccId , isShowAccountId} = useFetchApiAccount();

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

    const handleSearch = () => {
        const param: IParamSearchPendingOrder= {
            order_side: side,
            symbol_code: symbolCode,
            order_type: orderType,
            account_id: accountId
        }
        getParamSearch(param);
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

    const handleChangeAccountId = (event:any , values: any) => {
        values ? setAccountId(values) : setAccountId('*');
    }

    const handleKeyUpAccountId = (event:any) => {
        event.target.value ? setAccountId(event.target.value) : setAccountId('');
    }

    const _renderAccountId = () => (
        <div className="col-xl-2">
            <label className="d-block text-secondary mb-1">Account Id</label>
            <Autocomplete
                className='account-input'
                options={listAccId}
                onChange={handleChangeAccountId}
                onKeyUp={handleKeyUpAccountId}
                disablePortal
                defaultValue={accountId}
                value={accountId}
                getOptionLabel={(option) => option === "*" ? "" : option}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => <TextField {...params} placeholder="Search"/>}
            />  
        </div>
    )

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

    const handleOrderType = (value) => {
        setOrderType(convertNumber(value));
    }

    const _renderListOrderType = () => {
        return ORDER_TYPE_SEARCH.map((item, index) => (<option value={item.code} key={index}>{item.name}</option>))
    }

    const _renderOrderType = () => (
        <div className="col-xl-2">
            <label htmlFor="Groups" className="d-block text-secondary mb-1">Order Type</label>
            <select className="form-select form-select-sm input-select" onChange={(e) => handleOrderType(e.target.value)}>
                {_renderListOrderType()}
            </select>
        </div>
    )

    const _renderTemplate = () => (
        <div>
            <div className="card-body bg-gradient-light mb-3">
                <div className="row g-2 align-items-end">
                    {isShowAccountId && _renderAccountId()}
                    {_renderTicker()}
                    {_renderOrderType()}
                    {_renderOrderSide()}
                    <div className="col-xs-2 col-sm-2 col-md-2 col-lg-2">
                        <a href="#" className="btn btn-sm d-block btn-primary text-nowrap" onClick={handleSearch}><strong>Search</strong></a>
                    </div>
                </div>
                <div className='row g-2 align-items-end'>
                    <div className="col-xs-7 col-sm-7 col-md-7 col-lg-7">
                        {isUnAuthorised && <div className='text-danger'>Sorry. You have no rights to view Order of this account</div>}
                    </div>
                </div>
            </div>
        </div>
    )

    return _renderTemplate()


}
export default React.memo(ContentSearch)