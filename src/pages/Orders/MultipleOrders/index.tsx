import { useEffect, useState } from "react";
import Pagination from "../../../Common/Pagination";
import { LIST_TICKER_INFO, MESSAGE_TOAST, MSG_CODE, MSG_TEXT, OBJ_AUTHEN, RESPONSE_RESULT, SIDE, SIDE_NAME, SOCKET_CONNECTED, SYMBOL_LIST } from "../../../constants/general.constant";
import { IListOrder, ISymbolMultiOrder } from "../../../interfaces/order.interface";
import { wsService } from "../../../services/websocket-service";
import queryString from 'query-string';
import ReduxPersist from "../../../config/ReduxPersist";
import { IAuthen } from "../../../interfaces";
import * as rspb from "../../../models/proto/rpc_pb";
import * as tspb from '../../../models/proto/trading_model_pb';
import { formatNumber, formatCurrency, calcPriceIncrease, calcPriceDecrease } from "../../../helper/utils";
import CurrencyInput from 'react-currency-masked-input';
import './multipleOrders.css';
import * as tdspb from '../../../models/proto/trading_service_pb';
import * as smpb from '../../../models/proto/system_model_pb';
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import * as tdpb from '../../../models/proto/trading_model_pb';
import { Autocomplete, TextField } from "@mui/material";


const MultipleOrders = () => {
    const tradingModelPb: any = tspb;
    const tradingModel: any = tdpb;
    const [listTickers, setListTickers] = useState<ISymbolMultiOrder[]>([]);
    const [symbolListLocal, setSymbolListLocal] = useState(JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]'));
    const [dataConfirm, setDataConfirm] = useState<IListOrder[]>([]);
    const [showModalConfirmMultiOrders, setShowModalConfirmMultiOrders] = useState<boolean>(false);
    const [statusOrder, setStatusOrder] = useState(0);
    const [listSelected, setListSelected] = useState<ISymbolMultiOrder[]>([]);
    const [currentSide, setCurrentSide] = useState(tradingModel.OrderType.OP_SELL);
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(0);
    const [isAddOrder, setIsAddOrder] = useState(false);
    const [ticker, setTicker] = useState('');
    const [sideAddNew, setSideAddNew] = useState('Sell');

    useEffect(() => {
        const multiOrderResponse = wsService.getOrderSubject().subscribe(resp => {
            const systemModelPb: any = smpb;
            let tmp = 0;
            if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                tmp = RESPONSE_RESULT.success;
            } else {
                tmp = RESPONSE_RESULT.error;
            }
            getStatusOrderResponse(tmp, resp[MSG_TEXT]);
        });

        return () => {
            multiOrderResponse.unsubscribe();
        }
    }, []);

    const changeMultipleSide = (value: number, itemSymbol: ISymbolMultiOrder, index: number) => {
        switch (value) {
            case tradingModelPb.OrderType.OP_BUY.toString(): {
                listTickers[index].OrderSide = SIDE_NAME.buy;
                break;
            }
            default: {
                listTickers[index].OrderSide = SIDE_NAME.sell;
                break;
            }
        }
        const orders = [...listTickers];
        setListTickers(orders);
    }

    const changeVolume = (value: string, itemSymbol: ISymbolMultiOrder, index: number) => {
        const lotSize = getLotSize(itemSymbol.Ticker);
        const val = value.replaceAll(',', '');
        let newValue = '';
        if (!isNaN(Number(val))) {
            if (Number(val) > 0) {
                newValue = Number(val).toString();
            } else {
                newValue = lotSize.toString();
            }
        }
        listTickers[index].Volume = newValue;
        const listOrder = [...listTickers];
        setListTickers(listOrder);
    }

    const changePrice = (value: string, itemSymbol: ISymbolMultiOrder, index: number) => {
        const tickSize = getTickSize(itemSymbol.Ticker);
        const val = value.replaceAll(',', '');
        let newValue = '';
        if (!isNaN(Number(val))) {
            if (Number(val) > 0) {
                newValue = Number(val).toString();
            } else {
                newValue = tickSize.toString();
            }
        }
        listTickers[index].Price = newValue;
        const listOrder = [...listTickers];
        setListTickers(listOrder);
    }

    const getLotSize = (ticker: string) => {
        const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const lotSize = lstSymbols.find(o => o?.ticker === ticker)?.lotSize;
        if (lotSize) {
            return isNaN(Number(lotSize)) ? Number(lotSize) : 1;
        }
        return 1;
    }

    const getTickSize = (ticker: string) => {
        const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tickSize = lstSymbols.find(o => o?.ticker === ticker)?.tickSize;
        if (tickSize) {
            return isNaN(Number(tickSize)) ? Number(tickSize) : 1;
        }
        return 1;
    }

    const decreaseVolume = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const lotSize = getLotSize(itemSymbol.Ticker);
        const newValue = (Number(itemSymbol.Volume) - lotSize) > 0 ?  (Number(itemSymbol.Volume) - lotSize) : lotSize;
        listTickers[index].Volume = newValue.toString();
        const listOrder = [...listTickers];
        setListTickers(listOrder);
    }

    const increaseVolume = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const lotSize = getLotSize(itemSymbol.Ticker);
        const newValue = (Number(itemSymbol.Volume) + lotSize) > 0 ?  (Number(itemSymbol.Volume) + lotSize) : lotSize;
        listTickers[index].Volume = newValue.toString();
        const listOrder = [...listTickers];
        setListTickers(listOrder);
    }

    const decreasePrice = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const tickSize = getTickSize(itemSymbol.Ticker);
        const newValue = (Number(itemSymbol.Price) - tickSize) > 0 ?  (Number(itemSymbol.Price) - tickSize) : tickSize;
        listTickers[index].Price = newValue.toString();
        const listOrder = [...listTickers];
        setListTickers(listOrder);
    }

    const increasePrice = (itemSymbol: ISymbolMultiOrder, index: number) => {
        const tickSize = getTickSize(itemSymbol.Ticker);
        const newValue = (Number(itemSymbol.Price) + tickSize) > 0 ?  (Number(itemSymbol.Price) + tickSize) : tickSize;
        listTickers[index].Price = newValue.toString();
        const listOrder = [...listTickers];
        setListTickers(listOrder);
    }

    const handleChecked = (isChecked: boolean, item: ISymbolMultiOrder) => {
        const tmp = [...listSelected];
        if (isChecked) {
            tmp.push(item);
        } else {
            const index = tmp.findIndex((o: ISymbolMultiOrder) => o.No === item.No && o.Ticker == item.Ticker && o.OrderSide === item.OrderSide);
            if (index >= 0) {
                tmp.splice(index, 1);
            }
        }
        setListSelected(tmp);
    }

    const handleCheckedAll = (isChecked: boolean) => {
        if (isChecked) {
            setListSelected(listTickers);
        } else {
            setListSelected([]);
        }
    }

    const showScreenConfirmOrder = () => {
        if (listSelected.length > 0) {
            setShowModalConfirmMultiOrders(true);
        }
    }

    const deleteRecord = () => {
        const tmp = [...listTickers];
        listSelected.forEach(item => {
            const index = tmp.indexOf(item);
            if (index >= 0) {
                tmp.splice(index, 1);
            }
        });
        setListTickers(tmp);
        setListSelected([]);
    }

    const _renderHearderMultipleOrders = () => (
        <tr>
            <th>
                <input type="checkbox" value=""
                    name="allSelect"
                    onChange={(e: any) => handleCheckedAll(e.target.checked)}
                    checked={listSelected.length === listTickers.length && listSelected.length > 0}
                     />
            </th>
            <th><span>No.</span></th>
            <th className="text-left"><span>Ticker Code</span></th>
            <th className="text-left"><span>Ticker Name</span></th>
            <th className="text-left"><span>Order Type</span></th>
            <th className="text-left"><span>Order Side</span></th>
            <th className="text-end"><span>Volume</span></th>
            <th className="text-end"><span>Price</span></th>
        </tr>
    )

    const getTickerName = (ticker: string) => {
        const listSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tickerName = listSymbols.find(o => o?.ticker === ticker)?.tickerName;
        return tickerName ? tickerName : '';
    }

    const getOrderSideValue = (orderSide: string) => {
        if (orderSide) {
            switch (orderSide.toLocaleLowerCase()) {
                case SIDE_NAME.buy.toLocaleLowerCase(): {
                    return tradingModelPb.OrderType.OP_BUY;
                }
                default: {
                    return tradingModelPb.OrderType.OP_SELL;
                }
            }
        }
        return 0;
    }

    const _renderDataMultipleOrders = () => (
        listTickers.map((item: ISymbolMultiOrder, index: number) => {
            return <tr key={index}>
                <td><input type="checkbox" value=""  name={index.toString()} onChange={(e) => handleChecked(e.target.checked, item)} checked={listSelected.indexOf(item) >= 0} /></td>
                <td>{index + 1}</td>
                <td className="text-left">{item.Ticker}</td>
                <td className="text-left">{getTickerName(item.Ticker)}</td>
                <td className="text-left">Limit</td>
                <td className="text-left">
                    <select value={getOrderSideValue(item.OrderSide)} className={`border-1
                    ${(getOrderSideValue(item.OrderSide) === tradingModelPb.OrderType.OP_BUY) ? 'text-danger' : 'text-success'} text-end w-100-persent`}
                    onChange={(e: any) => changeMultipleSide(e.target.value, item, index)}>
                        <option value={tradingModelPb.OrderType.OP_BUY} className="text-danger text-left">Buy</option>
                        <option value={tradingModelPb.OrderType.OP_SELL} className="text-success text-left">Sell</option>
                    </select>
                </td>
                <td className="text-end">
                    <div className="d-flex">
                        <svg
                            onClick={() => decreaseVolume(item, index)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-left-fill"
                            viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                        </svg>
                        <CurrencyInput decimalscale={0} type="text" className="form-control text-end border-1 p-0"
                            onChange={(e) => changeVolume(e.target.value, item, index)}
                            thousandseparator="{true}" value={formatNumber(item.Volume)} placeholder=""
                        />
                        <svg
                            onClick={(e) => increaseVolume(item, index)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16"
                        >
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                        </svg>
                    </div>
                </td>
                <td className="text-end">
                    <div className="d-flex">
                        <svg
                            onClick={() => decreasePrice(item, index)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-left-fill"
                            viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                        </svg>
                        <CurrencyInput
                            onChange={(e) => changePrice(e.target.value, item, index)}
                            decimalscale={2} type="text" className="form-control text-end border-1 p-0"
                            thousandseparator="{true}" value={formatNumber(item.Price)} placeholder=""
                        />
                        <svg
                            onClick={(e) => increasePrice(item, index)}
                            xmlns="http://www.w3.org/2000/svg" width="16"
                            height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16">
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                        </svg>
                    </div>
                </td>
            </tr>
        })
    )

    const _renderHearderMultipleOrdersConfirm = () => (
        <tr>
            <th className="text-center text-nowrap" style={{width: '15%'}}><span>Ticker Code</span></th>
            <th className="text-center text-nowrap" style={{width: '25%'}}><span>Ticker Name</span></th>
            <th className="text-end text-nowrap" style={{width: '15%'}}><span>Order Type</span></th>
            <th className="text-end text-center text-nowrap" style={{width: '15%'}}><span>Order Side</span></th>
            <th className="text-end text-nowrap " style={{width: '15%'}}><span>Volume</span></th>
            <th className="text-end text-nowrap" style={{width: '15%'}}><span>Price</span></th>
        </tr>
    )
    const _renderDataMultipleOrdersConfirm = () => (
        listSelected.map((item, index) => {
            return <tr key={index}>
                <td className="text-nowrap">{item.Ticker}</td>
                <td className="text-nowrap">{getTickerName(item.Ticker)}</td>
                <td className="text-end">Limit</td>
                <td className={`${(getOrderSideValue(item.OrderSide) === tradingModelPb.OrderType.OP_BUY) ? 'text-danger' : 'text-success'} text-center w-100-persent text-nowrap`}>
                    {item.OrderSide}
                </td>
                <td className="text-end text-nowrap">{formatNumber(item.Volume)}</td>
                <td className="text-end text-nowrap"> {formatNumber(item.Price)}</td>
            </tr>
        })
    )

    const sendMessMultiRequest = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string | any = '';
        if (objAuthen.access_token) {
            accountId = objAuthen.account_id;
            ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen));
            prepareMessage(accountId);
            return;
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then(resp => {
            if (resp) {
                const obj: IAuthen = JSON.parse(resp);
                accountId = obj.account_id;
                prepareMessage(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID;
                prepareMessage(accountId);
                return;
            }
        });
    }

    const prepareMessage = (accountId: string) => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const tradingServicePb: any = tdspb;
        let wsConnected = wsService.getWsConnected();
        const tradingModelPb: any = tspb;
        if (wsConnected) {
            let currentDate = new Date();
            let multiOrder = new tradingServicePb.NewOrderMultiRequest();
            multiOrder.setSecretKey('');
            listSelected.forEach((item: ISymbolMultiOrder) => {
                const symbol = symbols.find(o => o.ticker === item.Ticker);
                let order = new tradingModelPb.Order();
                order.setAmount(item.Volume.replaceAll(',', ''));
                order.setPrice(item.Price.replaceAll(',', ''));
                order.setUid(accountId);
                order.setSymbolCode(symbol?.symbolId);
                order.setOrderType(getOrderSideValue(item.OrderSide));
                order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
                order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
                order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
                multiOrder.addOrder(order);
            })
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.NEW_ORDER_MULTI_REQ);
            rpcMsg.setPayloadData(multiOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            setShowModalConfirmMultiOrders(false);
        }
    }
    const getStatusOrderResponse = (value: number, content: string) => {
        if (statusOrder === 0) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
            </>
        }
        return <></>;
    }
    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )
    const _rendetMessageSuccess = (message: string) => {
        return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
    }

    const processData = (dataString: string) => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
     
        const list = [...listTickers];
        for (let i = 1; i < dataStringLines.length; i++) {
          const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
          if (headers && row.length == headers.length) {
            const obj: any = {};
            for (let j = 0; j < headers.length; j++) {
              let d = row[j];
              if (d.length > 0) {
                if (d[0] == '"')
                  d = d.substring(1, d.length - 1);
                if (d[d.length - 1] == '"')
                  d = d.substring(d.length - 2, 1);
              }
              if (headers[j]) {
                obj[headers[j]] = d;
              }
            }
     
            // remove the blank rows
            if (Object.values(obj).filter(x => x).length > 0) {
              list.push(obj);
            }
          }
        }
        setListTickers(list);
    }

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt: any) => {
          /* Parse data */
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          /* Get first worksheet */
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const data = XLSX.utils.sheet_to_csv(ws);
          processData(data);
        };
        reader.readAsBinaryString(file);
    }

    const handleSide = (value: string) => {
        setSideAddNew(value);
        switch (value.toLowerCase()) {
            case SIDE_NAME.buy.toLowerCase(): {
                setCurrentSide(tradingModel.OrderType.OP_BUY);
                break;
            }
            default: {
                setCurrentSide(tradingModel.OrderType.OP_SELL);
                break;
            }
        }
    }

    const _renderButtonSideOrder = (side: string, className: string, title: string, sideHandle: string, positionSelected1: string, positionSelected2: string) => (
        <button type="button"
            className={side === tradingModel.OrderType.OP_SELL ? `btn ${className} text-white flex-grow-1 p-2 text-center ${positionSelected1}` : `btn ${className} text-white flex-grow-1 p-2 text-center ${positionSelected2}`}
            onClick={() => handleSide(sideHandle)}>
            <span className="fs-5 text-uppercase">{title}</span>
        </button>
    )

    const handleChangeValue = (value: string, title: string) => {
        if (title.toLocaleLowerCase() === 'price') {
            setPrice(Number(value.replaceAll(',', '')));
        } else {
            setVolume(Number(value.replaceAll(',', '')));
        }
    }

    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => (
        <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
            <div className="flex-grow-1 py-1 px-2">
                <label className="text text-secondary">{title}</label>
                <CurrencyInput disabled={disableControl()} decimalscale={title.toLocaleLowerCase() === 'price' ? 2 : 0} type="text" className="form-control text-end border-0 p-0 fs-5 lh-1 fw-600" 
                value={title.toLocaleLowerCase() === 'price' ? price : volume}
                thousandseparator="{true}" placeholder="" onChange={(e) => handleChangeValue(e.target.value, title)}
                 />
            </div>
            <div className="border-start d-flex flex-column">
                <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperValue}>+</button>
                <button type="button" className="btn px-2 py-1 flex-grow-1" onClick={handleLowerValue}>-</button>
            </div>
        </div>
    )

    const handelUpperVolume = () => {
        let lotSize = 1;
        if (ticker?.trim() !== '') {
            const tickerCode = ticker.split('-')[0].trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.ticker === tickerCode);
            if (item) {
                lotSize = !isNaN(Number(item.lotSize)) ? Number(item.lotSize) : 1;
            }
            const currentVol = Number(volume);
            const nerwVol = currentVol + lotSize;
            setVolume(nerwVol);
        }
    }

    const handelLowerVolume = () => {
        let lotSize = 1;
        if (ticker?.trim() !== '') {
            const tickerCode = ticker.split('-')[0].trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.ticker === tickerCode);
            if (item) {
                lotSize = !isNaN(Number(item.lotSize)) ? Number(item.lotSize) : 1;
            }
            const currentVol = Number(volume);
            if (currentVol <= lotSize) {
                setVolume(lotSize);
                return;
            }
            const nerwVol = currentVol - lotSize;
            setVolume(nerwVol);
        }
    }

    const handleUpperPrice = () => {
        let tickSize = 1;
        if (ticker?.trim() !== '') {
            const tickerCode = ticker.split('-')[0].trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.ticker === tickerCode);
            if (item) {
                tickSize = !isNaN(Number(item.tickSize)) ? Number(item.tickSize) : 1;
            }
            const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
            const currentPrice = Number(price);
             const newPrice = calcPriceIncrease(currentPrice, tickSize, decimalLenght);
            setPrice(newPrice);
        }
        
    }

    const handleLowerPrice = () => {
        let tickSize = 1;
        if (ticker?.trim() !== '') {
            const tickerCode = ticker.split('-')[0].trim();
            const lstSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const item = lstSymbols.find(o => o.ticker === tickerCode);
            if (item) {
                tickSize = !isNaN(Number(item.tickSize)) ? Number(item.tickSize) : 1;
            }
            const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
            const currentPrice = Number(price);
             const newPrice = calcPriceDecrease(currentPrice, tickSize, decimalLenght);
            setPrice(newPrice);
        }
    }

    const handleChangeTicker = (value: string) => {
        setTicker(value);
    }

    const disableControl = () => {
        return ticker?.trim() === '';
    }

    const renderSymbolSelect = () => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const lstStr: string[] = [];
        symbols.forEach(item => {
            lstStr.push(`${item.ticker} - ${item.tickerName}`);
        });
        return <Autocomplete
                className='ticker-input'
                onChange={(event: any) => handleChangeTicker(event.target.innerText)}
                onKeyUp={(event: any) => handleChangeTicker(event.target.value)}
                disablePortal
                sx={{ width: 300 }}
                value={ticker}
                options={lstStr}
                renderInput={(params) => <TextField {...params} placeholder="Search Ticker" />}
            />
    }

    const disableButtonPlace = () => {
        return (ticker === '' || price === 0 || volume === 0);
    }

    const getSideName = (side: number) => {
        switch (side) {
            case tradingModelPb.OrderType.OP_BUY: {
                return 'Buy';
            }
            default: {
                return 'Sell'
            }
        }
    }

    const handlePlaceOrder = () => {
        const obj: ISymbolMultiOrder = {
            No: listTickers.length.toString(),
            OrderSide: sideAddNew,
            Price: price.toString(),
            Volume: volume.toString(),
            Ticker: ticker.split('-')[0]?.trim()
        }

        const tmp = [...listTickers];
        tmp.push(obj);
        setListTickers(tmp);
        setIsAddOrder(false);
        setPrice(0);
        setVolume(0);
    }

    const _renderOrderForm = () => (
        <div className="popup-box multiple-Order" >
            <div className="box d-flex">
                Add Order
                <span className="close-icon" onClick={() => setIsAddOrder(false)}>x</span>
            </div>
            <div className='content text-center' style={{height: '600px'}}>
            <form action="#" className="order-form p-2 border shadow my-3">
            <div className="order-btn-group d-flex align-items-stretch mb-2">
                {_renderButtonSideOrder(currentSide, 'btn-buy', 'Sell', 'Sell', 'selected', '')}
                {_renderButtonSideOrder(currentSide, 'btn-sell', 'Buy', 'Buy', '', 'selected')}
            </div>
            <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                <label className="text text-secondary">Ticker</label>
                <div className="fs-18 mr-3">
                    {renderSymbolSelect()}
                </div>
            </div>


            {_renderInputControl('Price', formatCurrency(price.toString()), handleUpperPrice, handleLowerPrice)}
            {_renderInputControl('Volume', formatNumber(volume.toString()), handelUpperVolume, handelLowerVolume)}

            <div className="border-top">

            <button className="btn btn-placeholder btn-primary-custom d-block fw-bold text-white mb-1 w-100"
            disabled={disableButtonPlace()}
            onClick={handlePlaceOrder} >Save</button>
            </div>
        </form>
            </div>
        </div>
    )

    const _renderPopupConfirm = () => {
        return <div className="popup-box multiple-Order" >
            <div className="box d-flex" style={{width: '40%'}}>
                Multiple Orders
                <span className="close-icon position-close-popup" onClick={() => setShowModalConfirmMultiOrders(false)}>x</span>
            </div>
            <div className='content text-center' style={{width: '40%'}}>
                <div className="table table-responsive mh-500 tableFixHead">
                    <table className="table table-sm table-hover mb-0 dataTable no-footer">
                        <thead>
                        {_renderHearderMultipleOrdersConfirm()}
                        </thead>
                        <tbody>
                        {_renderDataMultipleOrdersConfirm()}
                        </tbody>
                    </table>
                </div>
                
                
                <div className="text-end mb-3 mt-10">
                    <a href="#" className="btn btn-outline-secondary btn-clear mr-10" onClick={(e) => setShowModalConfirmMultiOrders(false)}>Clear</a>
                    <a href="#" className="btn btn-primary btn-submit" onClick={sendMessMultiRequest}>
                        Settlement</a>
                </div>
            </div>
        </div>
    }
    return <div className="site-main mt-3">
        <div className="container">
            <div className="card shadow mb-3">
                <div className="card-header">
                    <h6 className="card-title fs-6 mb-0">Multiple Orders</h6>
                </div>
                <div className="d-flex justify-content-sm-between m-3">
                    <div className="d-flex">
                        <button type="button" className="btn btn-warning" onClick={() => setIsAddOrder(true)}>Add Order</button>
                        <div className="upload-btn-wrapper">
                            <button className="btn btn-upload">Upload a file</button>
                            <input type="file" name="myfile" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
                        </div>
                    </div>
                    {listSelected.length > 0 &&
                        <div className="d-flex">
                        <button type="button" className="btn btn-danger ml-4" onClick={deleteRecord}>Delete</button>
                        <div className="d-flex">
                            <button type="button" className="btn btn-warning  ml-4">{listSelected.length} Selected</button>
                            <button type="button" className="btn btn-primary" style={{marginLeft: '5px'}} onClick={showScreenConfirmOrder}>Execute</button>
                        </div>
                    </div>
                    }
                </div>
                <div className="card-modify mb-3">
                    <div className="card-body p-0 mb-3 table table-responsive mh-500 tableFixHead">
                        <table className="table table-sm table-hover mb-0 dataTable no-footer">
                            <thead>
                                {_renderHearderMultipleOrders()}
                            </thead>
                            <tbody>
                                {_renderDataMultipleOrders()}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="m-3">
                    <Pagination />
                </div>
            </div>
        </div>
        {showModalConfirmMultiOrders && _renderPopupConfirm()}
        {isAddOrder && _renderOrderForm()}
    </div>

};
export default MultipleOrders;