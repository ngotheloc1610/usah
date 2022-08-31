import { useEffect, useMemo, useState } from 'react';
import { IAskAndBidPrice, ILastQuote, IParamOrder, IParamOrderModifyCancel, ISymbolQuote } from '../../interfaces/order.interface';
import '../../pages/Orders/OrderNew/OrderNew.scss';
import ConfirmOrder from '../Modal/ConfirmOrder';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { LIST_TICKER_INFO, MAX_ORDER_VOLUME, MESSAGE_TOAST, ORDER_TYPE_NAME, RESPONSE_RESULT, TITLE_ORDER_CONFIRM } from '../../constants/general.constant';
import * as tdpb from '../../models/proto/trading_model_pb';
import { calcPriceDecrease, calcPriceIncrease, checkMessageError, checkValue, convertNumber, formatCurrency, formatNumber, handleAllowedInput } from '../../helper/utils';
import { TYPE_ORDER_RES } from '../../constants/order.constant';
import NumberFormat from 'react-number-format';
import { wsService } from '../../services/websocket-service';
import { IQuoteEvent } from '../../interfaces/quotes.interface';

toast.configure()
interface IOrderForm {
    isOrderBook?: boolean;
    isMonitoring?: boolean;
    tickerCode?: string;
    isDashboard: boolean;
    symbolCode?: string;
    symbolQuote?: ISymbolQuote;
    quoteInfo?: IAskAndBidPrice;
    side?: number;
    messageSuccess: (item: string) => void;
}

const defaultDataModiFyCancel: IParamOrderModifyCancel = {
    tickerCode: '',
    tickerName: '',
    orderType: '',
    volume: '',
    price: 0,
    side: 0,
    confirmationConfig: false,
    tickerId: ''
}

const OrderForm = (props: IOrderForm) => {
    const { isDashboard, messageSuccess, symbolCode, side, quoteInfo, isMonitoring, isOrderBook } = props;
    const [tickerName, setTickerName] = useState('');
    const tradingModel: any = tdpb;
    const [currentSide, setCurrentSide] = useState(tradingModel.Side.NONE);
    const [isConfirm, setIsConfirm] = useState(false);
    const [validForm, setValidForm] = useState(false);
    const [paramOrder, setParamOrder] = useState(defaultDataModiFyCancel);
    const [lotSize, setLotSize] = useState(100);
    const [tickSize, setTickSize] = useState(0.01)
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(0);
    const [statusOrder, setStatusOrder] = useState(0);
    const [invalidPrice, setInvalidPrice] = useState(false);
    const [invalidVolume, setInvalidVolume] = useState(false);
    const [isMaxOrderVol, setIsMaxOrderVol] = useState(false);
    const [floorPrice, setFloorPrice] = useState(0);
    const [ceilingPrice, setCeilingPrice] = useState(0);
    const [isShowNotiErrorPrice, setIsShowNotiErrorPrice] = useState(false);

    const [statusCancel, setStatusCancel] = useState(0);
    const [statusModify, setStatusModify] = useState(0);

    const [isAllowed, setIsAllowed] = useState(false);
    const [lastQuotes, setLastQuotes] = useState<ILastQuote[]>([]);
    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [symbolInfor, setSymbolInfor] = useState<ISymbolQuote[]>([]);

    const [isRenderPrice, setIsRenderPrice] = useState(true);
    const [isRenderVolume, setIsRenderVolume] = useState(true);
    const maxOrderVolume = localStorage.getItem(MAX_ORDER_VOLUME) || Number.MAX_SAFE_INTEGER;

    useEffect(() => {
        setIsRenderPrice(true);
        setIsRenderVolume(true);
        if (symbolCode === '') {
            setCurrentSide(tradingModel.Side.NONE);
        }
    }, [symbolCode])

    useEffect(() => {
        // bug 60403
        if (symbolCode === '') {
            setCurrentSide(tradingModel.Side.NONE);
            return;
        }
        convertNumber(side) === tradingModel.Side.NONE || convertNumber(quoteInfo?.price) === 0 ? setCurrentSide(tradingModel.Side.NONE) : setCurrentSide(side);
    }, [side, symbolCode, quoteInfo])

    useEffect(() => {
        // các màn khác Monitoring khi chuyển symbol sẽ bỏ chọn side
        !isMonitoring && setCurrentSide(tradingModel.Side.NONE);
    }, [symbolCode, isMonitoring])

    useEffect(() => {
        const lastQuote = wsService.getDataLastQuotes().subscribe(quote => {
            if (quote && quote.quotesList) {
                setLastQuotes(quote.quotesList);
            }
        })

        const quoteEvent = wsService.getQuoteSubject().subscribe(quote => {
            if (quote && quote.quoteList) {
                setQuoteEvent(quote.quoteList);
            }
        });

        return () => {
            quoteEvent.unsubscribe();
            lastQuote.unsubscribe();
        }
    }, [])

    useEffect(() => {
        processQuoteEvent(quoteEvent);
    }, [quoteEvent])

    useEffect(() => {
        processLastQuote(lastQuotes)
    }, [lastQuotes, symbolCode])

    const processLastQuote = (quotes: ILastQuote[]) => {
        const symbolList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        if (quotes.length > 0) {
            let temp: ISymbolQuote[] = [];
            symbolList.forEach(symbol => {
                if (symbol) {
                    const element = quotes.find(o => o?.symbolCode === symbol?.symbolCode);
                    if (element) {
                        const symbolQuote: ISymbolQuote = {
                            symbolCode: symbol.symbolCode,
                            symbolId: symbol.symbolId,
                            symbolName: symbol.symbolName,
                            prevClosePrice: symbol.prevClosePrice,
                            high: element?.high || '0',
                            low: element?.low || '0',
                            lastPrice: element.currentPrice,
                            open: element.open || '0',
                            volume: element.volumePerDay,
                            ceiling: symbol.ceiling,
                            floor: symbol.floor
                        };
                        const index = temp.findIndex(o => o?.symbolCode === symbolQuote?.symbolCode);
                        if (index < 0) {
                            temp.push(symbolQuote);
                        }
                    }
                }
            });
            temp = temp.sort((a, b) => a?.symbolCode?.localeCompare(b?.symbolCode));
            setSymbolInfor(temp);
        }
    }

    const processQuoteEvent = (quotes: IQuoteEvent[]) => {
        setIsRenderPrice(false);
        setIsRenderVolume(false);
        const tempSymbolsList = [...symbolInfor];
        const tempLastQuotes = [...lastQuotes];
        if (quotes && quotes.length > 0) {
            quotes.forEach(item => {
                const idx = tempSymbolsList.findIndex(o => o?.symbolCode === item?.symbolCode);
                const index = lastQuotes.findIndex(o => o?.symbolCode === item?.symbolCode);
                if (idx >= 0) {
                    tempSymbolsList[idx] = {
                        ...tempSymbolsList[idx],
                        lastPrice: checkValue(tempSymbolsList[idx].lastPrice, item.currentPrice),
                    }
                }

                // set lại last quote
                if (index >= 0) {
                    tempLastQuotes[index] = {
                        ...tempLastQuotes[index],
                        currentPrice: checkValue(tempLastQuotes[index]?.currentPrice, item?.currentPrice),
                    }
                }
            });
            setSymbolInfor(tempSymbolsList);
            setLastQuotes(tempLastQuotes);
        }
    }

    useEffect(() => {
        if (price > ceilingPrice) {
            setIsShowNotiErrorPrice(true);
            return;
        }
        if (price < floorPrice) {
            setIsShowNotiErrorPrice(true);
            return;
        }
        setIsShowNotiErrorPrice(false);
        setInvalidPrice(Math.round(Number(price) * 100) % Math.round(tickSize * 100) !== 0);
        setInvalidVolume(volume % lotSize !== 0 || volume < 1);
        setIsMaxOrderVol(volume >= maxOrderVolume);
    }, [price, volume])

    useEffect(() => {
        if (symbolCode) {
            setIsShowNotiErrorPrice(false);
            setInvalidVolume(false);
            setIsMaxOrderVol(false);
            setInvalidPrice(false);
            setTickerName(symbolCode);
            const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const ticker = tickerList.find(item => item.symbolCode === symbolCode);
            const symbolItem = symbolInfor?.find(item => item.symbolCode === symbolCode);
            const tickSize = ticker?.tickSize;
            const lotSize = ticker?.lotSize;
            const minLot = ticker?.minLot;
            if (isRenderPrice) {
                if (isNaN(Number(quoteInfo?.price)) || quoteInfo?.symbolCode !== symbolItem?.symbolCode) {
                    convertNumber(symbolItem?.lastPrice) === 0 ? setPrice(convertNumber(symbolItem?.prevClosePrice)) : setPrice(convertNumber(symbolItem?.lastPrice));
                } else {
                    setPrice(convertNumber(quoteInfo?.price));
                }
            }
            setFloorPrice(Number(ticker?.floor));
            setCeilingPrice(Number(ticker?.ceiling));
            setTickSize(Number(tickSize));
            setLotSize(Number(lotSize));
            if (isRenderVolume) {
                if (symbolCode !== "") {
                    setVolume(convertNumber(minLot));
                } else {
                    setVolume(0);
                }
            }
        } else {
            setPrice(0);
            setVolume(0);
        }
    }, [symbolCode, symbolInfor, quoteInfo])
    
    useEffect(() => {
        if (quoteInfo) {
            const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const ticker = tickerList.find(item => item.symbolCode === symbolCode);
            const symbolItem = symbolInfor.find(item => item.symbolCode === symbolCode);
            const lotSize = ticker?.lotSize;
            const volume = convertNumber(quoteInfo.volume) === 0 ? lotSize : convertNumber(quoteInfo.volume)
            if (convertNumber(quoteInfo.price) === 0) {
                const price = convertNumber(symbolItem?.lastPrice) === 0 ? formatCurrency(symbolItem?.prevClosePrice || '') : formatCurrency(symbolItem?.lastPrice || '');
                setPrice(convertNumber(price));
            }
            else {
                setPrice(convertNumber(quoteInfo.price));
            }
            setVolume(volume);
        }
    }, [quoteInfo])

    useEffect(() => {
        if (symbolCode === "") {
            setVolume(0);
            return;
        }
        // khi đặt lệnh xong set lại volume = lotSize
        if (!isOrderBook) {
            currentSide === tradingModel.Side.NONE ? setVolume(lotSize) : setVolume(volume);
        }
    }, [currentSide])
    

    const _rendetMessageSuccess = (message: string, typeStatusRes: string) => {
        // To handle when order success then update new data without having to press f5
        messageSuccess(MESSAGE_TOAST.SUCCESS_PLACE);
        switch (typeStatusRes) {
            case TYPE_ORDER_RES.Order:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
            case TYPE_ORDER_RES.Cancel:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_CANCEL)}</div>
            case TYPE_ORDER_RES.Modify:
                return <div>{toast.success(MESSAGE_TOAST.SUCCESS_MODIFY)}</div>
        }
    }

    const _rendetMessageError = (message: string, msgCode) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.error(messageDis)}</div>
    }

    const handleSide = (value: string) => {
        setCurrentSide(value);
    }

    const handelUpperVolume = () => {
        setIsRenderVolume(false);
        const currentVol = Number(volume);
        const newVol = currentVol + lotSize;
        setVolume(newVol);
        setInvalidVolume(newVol % lotSize !== 0);
        setIsMaxOrderVol(newVol >= Number(maxOrderVolume));
        setValidForm(price > 0 && newVol > 0);
    }

    const handelLowerVolume = () => {
        setIsRenderVolume(false);
        const currentVol = Number(volume);
        if (currentVol <= lotSize) {
            setVolume(lotSize);
            return;
        }
        const newVol = currentVol - lotSize;
        setVolume(newVol);
        setInvalidVolume(newVol % lotSize !== 0);
        setIsMaxOrderVol(newVol >= Number(maxOrderVolume));
        setValidForm(price > 0 && newVol > 0);
    }

    const handleUpperPrice = () => {
        setIsRenderPrice(false);
        const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
        const currentPrice = Number(price);
        let newPrice = calcPriceIncrease(currentPrice, tickSize, decimalLenght);
        setPrice(newPrice);
        const temp = Math.round(Number(newPrice) * 100);
        const tempTickeSize = Math.round(tickSize * 100);
        setInvalidPrice(temp % tempTickeSize !== 0);
        setValidForm(newPrice > 0 && volume > 0);
        if (ceilingPrice === 0 && floorPrice === 0) {
            setIsShowNotiErrorPrice(false);
            return
        }
        if (newPrice > ceilingPrice) {
            setIsShowNotiErrorPrice(true);
            return;
        }
        if (newPrice < floorPrice) {
            setIsShowNotiErrorPrice(true);
            return;
        }
        setIsShowNotiErrorPrice(false);

    }

    const handleLowerPrice = () => {
        setIsRenderPrice(false);
        const currentPrice = Number(price);
        const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
        let newPrice = calcPriceDecrease(currentPrice, tickSize, decimalLenght);
        if (newPrice > 0) {
            setPrice(newPrice);
        }
        const temp = Math.round(Number(newPrice) * 100);
        const tempTickeSize = Math.round(tickSize * 100);
        setInvalidPrice(temp % tempTickeSize !== 0);
        setValidForm(newPrice > 0 && volume > 0);
        if (ceilingPrice === 0 && floorPrice === 0) {
            setIsShowNotiErrorPrice(false);
            return
        }
        if (newPrice > ceilingPrice) {
            setIsShowNotiErrorPrice(true);
            return;
        }
        if (newPrice < floorPrice) {
            setIsShowNotiErrorPrice(true);
            return;
        }
        setIsShowNotiErrorPrice(false);
    }

    const getStatusOrderResponse = (value: number, content: string, typeStatusRes: string, msgCode: number) => {
        if (typeStatusRes === TYPE_ORDER_RES.Order && statusOrder === 0) {
            setCurrentSide(tradingModel.Side.NONE);
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        if (typeStatusRes === TYPE_ORDER_RES.Modify && statusModify === 0) {
            setStatusModify(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        if (typeStatusRes === TYPE_ORDER_RES.Cancel && statusCancel === 0) {
            setStatusCancel(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content, msgCode)}
            </>
        }
        return <></>;
    }

    const togglePopup = () => {
        setIsConfirm(false);
    }

    const handlePlaceOrder = () => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const symbol = symbols?.find(o => o?.symbolCode === symbolCode);
        if (symbol) {
            const param = {
                tickerCode: symbol.symbolCode,
                tickerName: symbol.symbolName,
                orderType: ORDER_TYPE_NAME.limit,
                volume: volume.toString(),
                price: price,
                side: currentSide,
                confirmationConfig: false,
                tickerId: symbol.symbolId?.toString()
            }
            setParamOrder(param);
        }
        setIsConfirm(true);
    }

    const disableButtonPlace = (): boolean => {
        const isDisable = (Number(price) === 0 || Number(volume) === 0 || tickerName === '');
        return isDisable || isShowNotiErrorPrice || invalidVolume || invalidPrice || !currentSide || isMaxOrderVol;
    }

    const getClassNameSideBtn = (side: string, className: string, positionSell: string, positionBuy: string) => {
        if (convertNumber(side) !== tradingModel.Side.NONE) {
          return side === tradingModel.Side.SELL ? `btn ${className} rounded text-white flex-grow-1 p-2 text-center ${positionSell}` : `btn ${className} rounded text-white flex-grow-1 p-2 text-center ${positionBuy}`;
        }
        return `btn text-white rounded flex-grow-1 p-2 text-center `;
    }

    const _renderButtonSideOrder = (side: string, className: string, title: string, sideHandle: string, positionSell: string, positionBuy: string) => (
        <button type="button"
            className={getClassNameSideBtn(side, className, positionSell, positionBuy)}
            onClick={() => handleSide(sideHandle)}>
            <span className="fs-5 text-uppercase">{title}</span>
        </button>
    )

    const resetFormNewOrder = () => {
        if (symbolCode) {
            const symbolItem = symbolInfor.find(item => item.symbolCode === symbolCode);
            convertNumber(symbolItem?.lastPrice) === 0 ? setPrice(convertNumber(symbolItem?.prevClosePrice)) : setPrice(convertNumber(symbolItem?.lastPrice));
            setVolume(lotSize);
            return;
        }
        setPrice(0);
        setVolume(0);
    }
    const handleChangeVolume = (value: string) => {
        setIsRenderVolume(false);
        const volume = convertNumber(value);
        if ((volume || volume === 0) && volume > -1) {
            setVolume(volume);
            setInvalidVolume(volume % lotSize !== 0 || volume < 1);
            setIsMaxOrderVol(volume >= maxOrderVolume);
        }
    }

    const handleChangePrice = (value: string) => {
        setIsRenderPrice(false);
        const price = convertNumber(value);
        setPrice(price);
        if (ceilingPrice === 0 && floorPrice === 0) {
            setIsShowNotiErrorPrice(false);
            return;
        }
        if (+price > ceilingPrice) {
            setIsShowNotiErrorPrice(true);
        } else if (+price < floorPrice) {
            setIsShowNotiErrorPrice(true);
        } else {
            setIsShowNotiErrorPrice(false);
        }
        const temp = Math.round(+price * 100);
        const tempTickeSize = Math.round(tickSize * 100);
        setInvalidPrice(temp % tempTickeSize !== 0);
    }

    const _renderNotiErrorPrice = () => (
        <div className='text-danger text-end'>Out of daily price limits</div>
    )

    const disableChangeValueBtn = (symbolCode: string | undefined) => {
        if (symbolCode) {
            return false;
        }
        return true;
    }

    const handleKeyDown = (e) => {
        e.key !== 'Delete' ? setIsAllowed(true) : setIsAllowed(false);
    }

    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => {
        return <>
            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                <div className="flex-grow-1 py-1 px-2" onKeyDown={handleKeyDown}>
                    <label className="text text-secondary">{title}</label>
                    <NumberFormat decimalScale={title === TITLE_ORDER_CONFIRM.PRICE ? 2 : 0} type="text" className="form-control text-end border-0 p-0 fs-5 lh-1 fw-600"
                        thousandSeparator="," value={convertNumber(value) === 0 ? '' : formatCurrency(value)}
                        isAllowed={(e) => handleAllowedInput(e.value, isAllowed)}
                        onValueChange={title === TITLE_ORDER_CONFIRM.PRICE ? (e: any) => handleChangePrice(e.value) : (e: any) => handleChangeVolume(e.value)} />
                </div>
                <div className="border-start d-flex flex-column">
                    <button type="button" disabled={disableChangeValueBtn(symbolCode)} className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperValue}>+</button>
                    <button type="button" disabled={disableChangeValueBtn(symbolCode)} className="btn px-2 py-1 flex-grow-1" onClick={handleLowerValue}>-</button>
                </div>
            </div>
            {isShowNotiErrorPrice && title === TITLE_ORDER_CONFIRM.PRICE && symbolCode && _renderNotiErrorPrice()}
            <div>
                {title === TITLE_ORDER_CONFIRM.PRICE && invalidPrice && symbolCode && <span className='text-danger'>Invalid Price</span>}
            </div>
            {title === TITLE_ORDER_CONFIRM.QUANLITY && invalidVolume && symbolCode && <span className='text-danger'>Invalid volume</span>}
            {title === TITLE_ORDER_CONFIRM.QUANLITY && isMaxOrderVol && !invalidVolume && <span className='text-danger'>Quantity is exceed max order quantity: {maxOrderVolume}</span>}
        </>
    }
    
    // TODO: The type button has no default behavior, and does nothing when pressed by default
    const _renderPlaceButton = () => (
        <button type='button' className="btn btn-placeholder btn-primary-custom d-block fw-bold text-white mb-1 w-100"
            disabled={disableButtonPlace()}
            onClick={handlePlaceOrder} >Place</button>
    )

    const _renderResetButton = () => (
        <button type='button' className="btn btn-reset btn-outline-secondary d-block fw-bold mb-1 w-100"
            onClick={resetFormNewOrder}
        >Reset</button>
    )

    const _renderPriceInput = useMemo(() => _renderInputControl(TITLE_ORDER_CONFIRM.PRICE, price?.toString(), handleUpperPrice, handleLowerPrice), [price, isShowNotiErrorPrice, invalidPrice, isAllowed])

    const _renderVolumeInput = useMemo(() => _renderInputControl(TITLE_ORDER_CONFIRM.QUANLITY, volume?.toString(), handelUpperVolume, handelLowerVolume), [volume, invalidVolume, isAllowed])

    const _renderForm = () => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const existSymbol = symbols.find(symbol => symbol.symbolCode === symbolCode);
        return (
            <form action="#" className="order-form p-2 border shadow my-3" noValidate={true}>
                <div className="order-btn-group d-flex align-items-stretch mb-2">
                    {_renderButtonSideOrder(currentSide, 'btn-buy', 'Sell', tradingModel.Side.SELL, 'selected', '')}
                    <span className='w-2'></span>
                    {_renderButtonSideOrder(currentSide, 'btn-sell', 'Buy', tradingModel.Side.BUY, '', 'selected')}
                </div>
                <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                    <label className="text text-secondary">Ticker</label>
                    <div className="fs-18 mr-3">
                        <b>{existSymbol ? existSymbol.symbolCode : ''}</b>
                    </div>
                </div>

                {_renderPriceInput}
                {_renderVolumeInput}

                <div className="border-top">
                    {_renderPlaceButton()}
                    {isDashboard && _renderResetButton()}
                </div>
                {isConfirm && <ConfirmOrder handleCloseConfirmPopup={togglePopup} handleOrderResponse={getStatusOrderResponse} params={paramOrder} />}
            </form>
        )
    }

    return <div>
        {_renderForm()}
    </div>
}


export default OrderForm