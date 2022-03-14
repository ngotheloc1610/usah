import { useState, useEffect } from 'react'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service";
import * as tmpb from "../../../models/proto/trading_model_pb"
import * as qspb from "../../../models/proto/query_service_pb"
import * as rpcpb from "../../../models/proto/rpc_pb";
import * as smpb from '../../../models/proto/system_model_pb';
import '../OrderHistory/orderHistory.scss'
import sendMsgSymbolList from '../../../Common/sendMsgSymbolList';
import { convertDatetoTimeStamp, getSymbolCode, removeFocusInput } from '../../../helper/utils';
import { ACCOUNT_ID, FROM_DATE_TIME, LIST_TICKER_INFO, MSG_CODE, MSG_TEXT, RESPONSE_RESULT, SOCKET_CONNECTED, TO_DATE_TIME } from '../../../constants/general.constant';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

interface IPropsSearchTradeHistory {
    getOrderSide: (item: number) => void
}

function SearchTradeHistory(props: IPropsSearchTradeHistory) {
    const { getOrderSide } = props
    const [symbolCode, setSymbolCode] = useState('')
    const [orderSideBuy, setOrderSideBuy] = useState(false);
    const [orderSideSell, setOrderSideSell] = useState(false);
    const [side, setSide] = useState(0);
    const [fromDatetime, setDateTimeFrom] = useState(0);
    const [toDatetime, setDateTimeTo] = useState(0);
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([]);
    const [listSymbolName, setListSymbolName] = useState<string[]>([]);
    const [currentDate, setCurrentDate] = useState('');
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');

    useEffect(() => {
        const today: number = new Date().getDate();
        let currentDate = '';
        if (today > 0 && today < 10) {
            currentDate = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-0${new Date().getDate()}`;
        } else {
            currentDate = `${new Date().getFullYear()}-0${(new Date().getMonth() + 1)}-${new Date().getDate()}`;
        }
        setCurrentDate(currentDate);
        setDateTimeFrom(convertDatetoTimeStamp(currentDate, FROM_DATE_TIME));
        setDateTimeTo(convertDatetoTimeStamp(currentDate, TO_DATE_TIME));
    }, [])

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

    const handleChangeFromDate = (value: string) => {
        setDateTimeFrom(convertDatetoTimeStamp(value, FROM_DATE_TIME))
    }

    const handleChangeToDate = (value: string) => {
        setDateTimeTo(convertDatetoTimeStamp(value, TO_DATE_TIME))
    }

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
            const listSymbolName: string[] = []
            res.symbolList.forEach((item: ISymbolList) => {
                listSymbolName.push(`${item.symbolName} (${item.symbolCode})`);
            });
            setListSymbolName(listSymbolName)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    const sendMessageTradeSearch = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        buildMessage(accountId);
    }

    const buildMessage = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let tradeHistoryRequest = new queryServicePb.GetTradeHistoryRequest();

            tradeHistoryRequest.setAccountId(Number(accountId));
            tradeHistoryRequest.setSymbolCode(symbolCode);
            tradeHistoryRequest.setSide(side);
            tradeHistoryRequest.setFromDatetime(fromDatetime);
            tradeHistoryRequest.setToDatetime(toDatetime);

            const rpcPb: any = rpcpb;
            let rpcMsg = new rpcPb.RpcMessage();
            rpcMsg.setPayloadClass(rpcPb.RpcMessage.Payload.TRADE_HISTORY_REQ);
            rpcMsg.setPayloadData(tradeHistoryRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
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
        sendMessageTradeSearch();
        getOrderSide(side);
    }

    const handlKeyDown = (event: any) => {
        if (symbolCode !== '' || side !== 0 || fromDatetime !== 0 || toDatetime !== 0) {
            if (event.key === 'Enter') {
                sendMessageTradeSearch();
                getOrderSide(side);
                const el: any = document.querySelectorAll('.input-select');
                removeFocusInput(el);
            }
        }
    }

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

    const handleChangeTicker = (value: string) => {
        if (value !== undefined) {
            setSymbolCode(getSymbolCode(value, symbolsList));
        } else {
            setSymbolCode('');
        }
    }

    const handleKeyUp = (value: string) => {
        if (value !== undefined) {
            setSymbolCode(getSymbolCode(value, symbolsList));
        } else {
            setSymbolCode('');
        }
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
                <h6 className="card-title fs-6 mb-0">Trade History</h6>
            </div>
            <div className="card-body bg-gradient-light" onKeyDown={handlKeyDown}>
                <div className="row g-2 align-items-end">
                    {_renderTicker()}
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

export default SearchTradeHistory