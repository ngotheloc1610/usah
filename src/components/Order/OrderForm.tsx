import { useEffect, useMemo, useState } from 'react';
import { IAskAndBidPrice, ISymbolQuote } from '../../interfaces/order.interface';
import '../../pages/Orders/OrderNew/OrderNew.scss';
import ConfirmOrder from '../Modal/ConfirmOrder';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { LIST_TICKER_INFO, MAX_ORDER_VALUE, MAX_ORDER_VOLUME, MESSAGE_TOAST, RESPONSE_RESULT, TITLE_ORDER_CONFIRM, MIN_ORDER_VALUE } from '../../constants/general.constant';
import * as tdpb from '../../models/proto/trading_model_pb';
import { calcCeilFloorPrice, calcDefaultVolumeInput, calcPriceDecrease, calcPriceIncrease, checkMessageError, checkPriceTickSize, checkValue, checkVolumeLotSize, convertNumber, formatCurrency, formatNumber, handleAllowedInput } from '../../helper/utils';
import { MESSAGE_EMPTY_ASK, MESSAGE_EMPTY_BID, TYPE_ORDER_RES } from '../../constants/order.constant';
import NumberFormat from 'react-number-format';
import { wsService } from '../../services/websocket-service';
import { IQuoteEvent } from '../../interfaces/quotes.interface';
import { DEFAULT_DATA_MODIFY_CANCEL } from '../../mocks';
import Decimal from 'decimal.js';
import { ISymbolList } from '../../interfaces/ticker.interface';
import * as qmpb from '../../models/proto/query_model_pb';

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

const OrderForm = (props: IOrderForm) => {
    const { isDashboard, messageSuccess, symbolCode, side, quoteInfo, isMonitoring, isOrderBook } = props;
    const [tickerName, setTickerName] = useState('');
    const tradingModel: any = tdpb;
    const queryModelPb: any = qmpb;
    const [currentSide, setCurrentSide] = useState(tradingModel.Side.NONE);
    const [isConfirm, setIsConfirm] = useState(false);
    const [paramOrder, setParamOrder] = useState(DEFAULT_DATA_MODIFY_CANCEL);
    const [lotSize, setLotSize] = useState(0);
    const [minLot, setMinLot] = useState(0);
    const [tickSize, setTickSize] = useState(0)
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(0);
    const [statusOrder, setStatusOrder] = useState(0);
    const [invalidPrice, setInvalidPrice] = useState(false);
    const [invalidVolume, setInvalidVolume] = useState(false);
    const [isMaxOrderVol, setIsMaxOrderVol] = useState(false);
    const [floorPrice, setFloorPrice] = useState(0);
    const [ceilingPrice, setCeilingPrice] = useState(0);
    const [isOutOfDailyPrice, setIsOutOfDailyPrice] = useState(false);

    const [statusCancel, setStatusCancel] = useState(0);
    const [statusModify, setStatusModify] = useState(0);

    const [isAllowed, setIsAllowed] = useState(false);

    // symbolCode => Quote
    // Cached latest quote for each symbolCode
    const [lastQuoteMap, setLastQuoteMap] = useState<Map<string, IQuoteEvent>>(new Map());

    // We don't change ref of lastQuoteMap, so use this flag to trigger render in
    // order form, validations...
    // when there is new QuoteEvent for current selected symbol
    const [flagUpdateQuote, setFlagUpdateQuote] = useState<boolean>(true);

    const [quoteEvent, setQuoteEvent] = useState<IQuoteEvent[]>([]);
    const [symbolInfor, setSymbolInfor] = useState<Map<string, ISymbolQuote>>();
    const [symbolListMap, setSymbolListMap] = useState<Map<string, ISymbolList>>(new Map())

    const [isRenderPrice, setIsRenderPrice] = useState(true);
    const [isRenderVolume, setIsRenderVolume] = useState(true);

    const [isEmptyAsk, setIsEmptyAsk] = useState(false);
    const [isEmptyBid, setIsEmptyBid] = useState(false);

    const [orderType, setOrderType] = useState(tradingModel.OrderType.OP_LIMIT);

    const [bestAskPrice, setBestAskPrice] = useState(0);
    const [bestBidPrice, setBestBidPrice] = useState(0);

    // NOTE: When change orderType from Market to Limit, set Price default is LastPrice or ClosePrice
    // so state limitPrice use to set LastPrice or ClosePrice
    const [limitPrice, setLimitPrice] = useState(0);

    const maxOrderVolume = localStorage.getItem(MAX_ORDER_VOLUME) || Number.MAX_SAFE_INTEGER;
    const maxOrderValue = localStorage.getItem(MAX_ORDER_VALUE) || Number.MAX_SAFE_INTEGER;
    const listSymbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');

    const checkSymbolValid = (symbolCode: string) => {
        const index = listSymbols.findIndex(item => item.symbolCode === symbolCode);
        return index >= 0;
    }

    useEffect(() => {
        listSymbols.forEach((item) => {
            if (item.symbolStatus !== queryModelPb.SymbolStatus.SYMBOL_DEACTIVE) {
                symbolListMap.set(item.symbolCode, item);
            }
        })
    }, [])
    
    useEffect(() => {
        setIsRenderPrice(true);
        setIsRenderVolume(true);
        if (symbolCode === '') {
            setCurrentSide(tradingModel.Side.NONE);
        }
        setOrderType(tradingModel.OrderType.OP_LIMIT);
        if(symbolCode) {
            const symbol = symbolListMap.get(symbolCode);
            if (symbol) {
                setVolume(convertNumber(calcDefaultVolumeInput(symbol.minLot, symbol.lotSize)));
            }
        }
    }, [symbolCode])

    useEffect(() => {
        if (symbolCode && checkSymbolValid(symbolCode)) {
            if (orderType === tradingModel.OrderType.OP_MARKET) {
                let tempPrice = 0;
                if (currentSide === tradingModel.Side.BUY) tempPrice = bestAskPrice;
                if (currentSide === tradingModel.Side.SELL) tempPrice = bestBidPrice;
                setPrice(tempPrice);
            }
        }else {
            setPrice(0);
        }
    }, [orderType, currentSide, bestBidPrice, bestAskPrice, symbolCode])

    useEffect(() => {
        if (orderType === tradingModel.OrderType.OP_LIMIT) {
            setPrice(limitPrice);
        }
    }, [orderType, limitPrice])

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
        const lastQuote = wsService.getDataLastQuotes().subscribe(lastQuoteResp => {
            if (lastQuoteResp && lastQuoteResp.quotesList) {
                for (const quote of lastQuoteResp.quotesList) {
                    lastQuoteMap.set(quote.symbolCode, quote);
                }

                setFlagUpdateQuote(!flagUpdateQuote);
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
    }, [quoteEvent, orderType])

    useEffect(() => {
        processLastQuote();
    }, [flagUpdateQuote, symbolCode, orderType])

    const processLastQuote = () => {
        const symbolList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const quote = lastQuoteMap.get(symbolCode || '');
        if (quote) {
            setIsEmptyAsk(quote.asksList.length === 0);
            setIsEmptyBid(quote.bidsList.length === 0);
            const bestAsk = quote.asksList.length > 0 ? convertNumber(quote.asksList[0]?.price) : 0;
            const bestBid = quote.bidsList.length > 0 ? convertNumber(quote.bidsList[0]?.price) : 0;
            setBestAskPrice(bestAsk);
            setBestBidPrice(bestBid);
            if (orderType === tradingModel.OrderType.OP_MARKET) {
                setParamOrder({
                    ...paramOrder,
                    price: currentSide === tradingModel.Side.BUY ? bestAsk : bestBid
                });
            }
        } else {
            setIsEmptyAsk(true);
            setIsEmptyBid(true);
        }

        const tmpQuoteMap = new Map();
        symbolList.forEach(symbol => {
            if (symbol) {
                const quote = lastQuoteMap.get(symbol.symbolCode);
                const symbolQuote: ISymbolQuote = {
                    symbolCode: symbol.symbolCode,
                    symbolId: symbol.symbolId,
                    symbolName: symbol.symbolName,
                    prevClosePrice: symbol.prevClosePrice,
                    high: quote?.high || '0',
                    low: quote?.low || '0',
                    lastPrice: quote?.currentPrice || '0',
                    open: quote?.open || '0',
                    volume: quote?.volumePerDay || '0',
                    ceiling: symbol.ceiling,
                    floor: symbol.floor
                };
                tmpQuoteMap.set(symbol.symbolCode, symbolQuote)
            }
        });
        setSymbolInfor(tmpQuoteMap);
    }

    const processQuoteEvent = (quotes: IQuoteEvent[]) => {
        // setIsRenderPrice(false);
        setIsRenderVolume(false);

        if (quotes && quotes.length > 0) {
            const quote = quotes.find(o => o?.symbolCode === symbolCode);
            if (quote) {
                const bestAsk = quote.asksList.length > 0 ? convertNumber(quote.asksList[0]?.price) : 0;
                const bestBid = quote.bidsList.length > 0 ? convertNumber(quote.bidsList[0]?.price) : 0;
                setBestAskPrice(bestAsk);
                setBestBidPrice(bestBid);
                if (orderType === tradingModel.OrderType.OP_MARKET) {
                    setParamOrder({
                        ...paramOrder,
                        price: currentSide === tradingModel.Side.BUY ? bestAsk : bestBid
                    });
                }
            }

            quotes.forEach(item => {
                if(item && symbolInfor) {
                    let quoteUpdate = symbolInfor.get(item?.symbolCode)
                    if(quoteUpdate) {
                        quoteUpdate = {
                            ...quoteUpdate,
                            lastPrice: checkValue(quoteUpdate.lastPrice, item.currentPrice),
                        }
                        symbolInfor.set(item.symbolCode, quoteUpdate)
                    }
                }

                // Cache the latest quote event for symbol
                lastQuoteMap.set(item.symbolCode, item);
            });

            if (quote) {
                setFlagUpdateQuote(!flagUpdateQuote);
            }
        }
    }

    useEffect(() => {
        if (price > ceilingPrice) {
            setIsOutOfDailyPrice(true);
            return;
        }
        if (price < floorPrice) {
            setIsOutOfDailyPrice(true);
            return;
        }
        setIsOutOfDailyPrice(false);
        setInvalidPrice(!checkPriceTickSize(price, tickSize));
        setInvalidVolume(volume % lotSize !== 0 || volume < minLot);
        setIsMaxOrderVol(volume > convertNumber(maxOrderVolume));
    }, [price, volume, minLot, ceilingPrice, floorPrice])

    useEffect(() => {
        if (symbolCode) {
            setTickerName(symbolCode);
            const ticker = symbolListMap.get(symbolCode);
            const symbolItem = symbolInfor?.get(symbolCode);
            const tickSize = ticker?.tickSize;
            const lotSize = ticker?.lotSize;
            const minLot = ticker?.minLot;
            const {ceilingPrice, floorPrice} = calcCeilFloorPrice(convertNumber(symbolItem?.lastPrice), ticker)

            if (isRenderPrice && symbolItem) {
                if (isNaN(Number(quoteInfo?.price)) || quoteInfo?.symbolCode !== symbolItem?.symbolCode) {
                    convertNumber(symbolItem?.lastPrice) === 0 ? setPrice(convertNumber(symbolItem?.prevClosePrice)) : setPrice(convertNumber(symbolItem?.lastPrice));
                    convertNumber(symbolItem?.lastPrice) === 0 ? setLimitPrice(convertNumber(symbolItem?.prevClosePrice)) : setLimitPrice(convertNumber(symbolItem?.lastPrice));
                } else {
                    setPrice(convertNumber(quoteInfo?.price));
                    setLimitPrice(convertNumber(quoteInfo?.price));
                }
            }
            
            setCeilingPrice(convertNumber(formatCurrency(ceilingPrice.toString())));
            setFloorPrice(convertNumber(formatCurrency(floorPrice.toString())));

            setTickSize(Number(tickSize));
            setLotSize(Number(lotSize));
            setMinLot(convertNumber(minLot));
            if (isRenderVolume) {
                if (symbolCode !== "") {
                    setVolume(convertNumber(calcDefaultVolumeInput(minLot, lotSize)));
                } else {
                    setVolume(0);
                }
            }
        } else {
            setPrice(0);
            setVolume(0);
        }
    }, [symbolCode, symbolInfor, quoteInfo, orderType, isRenderPrice, isRenderVolume])

    useEffect(() => {
        if (quoteInfo && symbolCode) {
            const ticker = symbolListMap.get(symbolCode);
            const symbolItem = symbolInfor?.get(symbolCode);
            const lotSize = ticker?.lotSize;
            const minLot = ticker?.minLot;
            const volume = convertNumber(quoteInfo.volume) === 0 ? convertNumber(calcDefaultVolumeInput(minLot, lotSize)) : convertNumber(quoteInfo.volume)
            if (convertNumber(quoteInfo.price) === 0) {
                const price = convertNumber(symbolItem?.lastPrice) === 0 ? formatCurrency(symbolItem?.prevClosePrice || '') : formatCurrency(symbolItem?.lastPrice || '');
                setPrice(convertNumber(price));
                setLimitPrice(convertNumber(price))
            }
            else {
                setPrice(convertNumber(quoteInfo.price));
                setLimitPrice(convertNumber(quoteInfo.price))
            }
            setVolume(volume);
            setInvalidVolume(volume < 0);
            setIsMaxOrderVol(false);
        }
    }, [quoteInfo, orderType])

    useEffect(() => {
        if (symbolCode === "") {
            setVolume(0);
            return;
        }
        // khi đặt lệnh xong set lại volume = lotSize
        if (!isOrderBook) {
            currentSide === tradingModel.Side.NONE ? setVolume(convertNumber(calcDefaultVolumeInput(minLot, lotSize))) : setVolume(volume);
        }
    }, [currentSide])

    useEffect(() => {
        if (orderType === tradingModel.OrderType.OP_MARKET) {
            setParamOrder({
                ...paramOrder,
                price: currentSide === tradingModel.Side.BUY ? bestAskPrice : bestBidPrice
            })
        }
    }, [currentSide, bestAskPrice, bestBidPrice, orderType])


    useEffect(() => {
        setIsMaxOrderVol(false);
    }, [symbolCode, quoteInfo])

    const _renderMessageSuccess = (message: string, typeStatusRes: string) => {
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

    const _renderMessageError = (message: string, msgCode) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.error(messageDis)}</div>
    }

    const _renderMessageWarning = (message: string, msgCode) => {
        const messageDis = checkMessageError(message, msgCode);
        return <div>{toast.warning(messageDis)}</div>
    }

    const handleSide = (value: string) => {
        setCurrentSide(value);
    }

    const handelUpperVolume = () => {
        setIsRenderVolume(false);
        const currentVol = Number(volume);
        let newVol = currentVol + lotSize;
        if (!checkVolumeLotSize(newVol, lotSize)) {
            const temp = new Decimal(newVol);

            // Eg: LotSize: 3, CurrentVolume: 611 => NewVolume: '612'
            const strVol = convertNumber(lotSize) === 0 ? '0' : temp.dividedBy(lotSize).floor().mul(lotSize).toString();
            newVol = convertNumber(strVol);
        }
        setVolume(newVol);
        setInvalidVolume(newVol % lotSize !== 0);
        setIsMaxOrderVol(newVol > Number(maxOrderVolume));
    }

    const handelLowerVolume = () => {
        setIsRenderVolume(false);
        const currentVol = Number(volume);
        let newVol = currentVol - lotSize;
        if (newVol < minLot) {
            return;
        }
        const temp = new Decimal(newVol);

        // Eg: LotSize: 3, CurrentVolume: 611 => NewVolume: '609'
        const strVol = convertNumber(lotSize) === 0 ? '0' : temp.dividedBy(lotSize).ceil().mul(lotSize).toString();
        newVol = convertNumber(strVol);

        setVolume(newVol);
        setInvalidVolume(newVol % lotSize !== 0);
        setIsMaxOrderVol(newVol > Number(maxOrderVolume));
    }

    const handleUpperPrice = () => {
        setIsRenderPrice(false);
        const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
        const currentPrice = Number(price);
        let newPrice = calcPriceIncrease(currentPrice, tickSize, decimalLenght);
        if (!checkPriceTickSize(newPrice, tickSize)) {
            const temp = new Decimal(newPrice);

            // Eg: TickSize: 0.03, CurrentPrice: 186.02 => NewPrice: '186.03'
            const strPrice = convertNumber(tickSize) === 0 ? '0' : temp.dividedBy(tickSize).floor().mul(tickSize).toString();
            newPrice = convertNumber(strPrice);
        }
        setPrice(newPrice);
        setLimitPrice(newPrice);
        if (ceilingPrice === 0 && floorPrice === 0) {
            setIsOutOfDailyPrice(false);
            return
        }
        if (newPrice > ceilingPrice) {
            setIsOutOfDailyPrice(true);
            return;
        }
        if (newPrice < floorPrice) {
            setIsOutOfDailyPrice(true);
            return;
        }
        setIsOutOfDailyPrice(false);

    }

    const handleLowerPrice = () => {
        setIsRenderPrice(false);
        const currentPrice = Number(price);
        const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
        let newPrice = calcPriceDecrease(currentPrice, tickSize, decimalLenght);
        if (!checkPriceTickSize(newPrice, tickSize)) {
            const temp = new Decimal(newPrice);

            // Eg: TickSize: 0.03, CurrentPrice: 186.02 => NewPrice: '186.00'
            const strPrice = convertNumber(tickSize) === 0 ? '0' : temp.dividedBy(tickSize).ceil().mul(tickSize).toString();
            newPrice = convertNumber(strPrice);
        }
        if (newPrice > 0) {
            setPrice(newPrice);
            setLimitPrice(newPrice);
        }
        if (ceilingPrice === 0 && floorPrice === 0) {
            setIsOutOfDailyPrice(false);
            return
        }
        if (newPrice > ceilingPrice) {
            setIsOutOfDailyPrice(true);
            return;
        }
        if (newPrice < floorPrice) {
            setIsOutOfDailyPrice(true);
            return;
        }
        setIsOutOfDailyPrice(false);
    }

    const getStatusOrderResponse = (value: number, content: string, typeStatusRes: string, msgCode: number) => {
        if (typeStatusRes === TYPE_ORDER_RES.Order && statusOrder === 0) {
            setCurrentSide(tradingModel.Side.NONE);
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        if (typeStatusRes === TYPE_ORDER_RES.Modify && statusModify === 0) {
            setStatusModify(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        if (typeStatusRes === TYPE_ORDER_RES.Cancel && statusCancel === 0) {
            setStatusCancel(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _renderMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _renderMessageError(content, msgCode)}
                {(value === RESPONSE_RESULT.warning && content !== '') && _renderMessageWarning(content, msgCode)}
            </>
        }
        return <></>;
    }

    const togglePopup = () => {
        setIsConfirm(false);
    }

    const handlePlaceOrder = () => {
        if(symbolCode) {
            const symbol = symbolListMap.get(symbolCode);
            if (symbol) {
                const param = {
                    tickerCode: symbol.symbolCode,
                    tickerName: symbol.symbolName,
                    orderType: orderType,
                    volume: volume.toString(),
                    price: orderType === tradingModel.OrderType.OP_LIMIT ? price : paramOrder.price,
                    side: currentSide,
                    confirmationConfig: false,
                    tickerId: symbol.symbolId?.toString()
                }
                setParamOrder(param);
            }
            setIsConfirm(true);
        }
    }

    const disableButtonPlace = (): boolean => {
        let isInvalidMarketPrice = true;
        if (orderType === tradingModel.OrderType.OP_MARKET) {
            if (currentSide === tradingModel.Side.BUY) isInvalidMarketPrice = bestAskPrice === 0;
            if (currentSide === tradingModel.Side.SELL) isInvalidMarketPrice = bestBidPrice === 0;
        } else {
            isInvalidMarketPrice = false;
        }

        if (price === 0 || volume === 0) {
            return true
        }

        if (calcGrossValue(price, volume) > convertNumber(maxOrderValue)) {
            return true;
        }

        const isDisable = Number(price) === 0 || Number(volume) === 0 || tickerName === '' || isInvalidMarketPrice;
        return isDisable || isOutOfDailyPrice || invalidVolume || invalidPrice || currentSide === tradingModel.Side.NONE || isMaxOrderVol;
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
        if (symbolCode && symbolInfor) {
            const symbolItem = symbolInfor.get(symbolCode);
            convertNumber(symbolItem?.lastPrice) === 0 ? setPrice(convertNumber(symbolItem?.prevClosePrice)) : setPrice(convertNumber(symbolItem?.lastPrice));
            setVolume(convertNumber(calcDefaultVolumeInput(minLot, lotSize)));
            setIsOutOfDailyPrice(false);
            setInvalidVolume(false);
            setIsMaxOrderVol(false);
            setInvalidPrice(false);
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
            setInvalidVolume(volume % lotSize !== 0 || volume < minLot);
            setIsMaxOrderVol(volume > convertNumber(maxOrderVolume));
        }
    }

    const handleChangePrice = (value: string) => {
        setIsRenderPrice(false);
        const price = convertNumber(value);
        setPrice(price);
        setLimitPrice(price);
        if (ceilingPrice === 0 && floorPrice === 0) {
            setIsOutOfDailyPrice(false);
            return;
        }
        if (+price > ceilingPrice) {
            setIsOutOfDailyPrice(true);
        } else if (+price < floorPrice) {
            setIsOutOfDailyPrice(true);
        } else {
            setIsOutOfDailyPrice(false);
        }
        setInvalidPrice(!checkPriceTickSize(price, tickSize));
    }

    const disableChangeValueBtn = (symbolCode: string | undefined) => {
        if (symbolCode) {
            return false;
        }
        return true;
    }

    const handleKeyDown = (e) => {
        e.key !== 'Delete' ? setIsAllowed(true) : setIsAllowed(false);
    }

    const calcGrossValue = (price: number, volume: number) => {
        const tempPrice = new Decimal(price);
        const grossVal = tempPrice.times(volume);
        return convertNumber(grossVal);
    }

    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => {
        return <>
            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                <div className='flex-grow-1 py-1 px-2' onKeyDown={handleKeyDown}>
                    <label className="text text-secondary">{title}</label>
                    <NumberFormat decimalScale={title === TITLE_ORDER_CONFIRM.PRICE ? 2 : 0} type="text"
                        maxLength={15}
                        className='form-control text-end border-0 p-0 fs-5 lh-1 fw-600'
                        thousandSeparator=","
                        value={convertNumber(value) === 0 ? '' : formatCurrency(value)}
                        isAllowed={(e) => handleAllowedInput(e.value, isAllowed)}
                        onValueChange={title === TITLE_ORDER_CONFIRM.PRICE ? (e: any) => handleChangePrice(e.value) : (e: any) => handleChangeVolume(e.value)}
                    />
                </div>
                <div className="border-start d-flex flex-column">
                    <button type="button" disabled={disableChangeValueBtn(symbolCode)} className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperValue}>+</button>
                    <button type="button" disabled={disableChangeValueBtn(symbolCode)} className="btn px-2 py-1 flex-grow-1" onClick={handleLowerValue}>-</button>
                </div>
            </div>
            {limitPrice !== 0 && isOutOfDailyPrice && title === TITLE_ORDER_CONFIRM.PRICE && symbolCode && orderType === tradingModel.OrderType.OP_LIMIT &&
                <div className='text-danger text-end fs-px-13'>Out of daily price limits</div>
            }
            {title === TITLE_ORDER_CONFIRM.PRICE && invalidPrice && symbolCode && <div className='text-danger fs-px-13 text-end'>Invalid Price</div>}
            {title === TITLE_ORDER_CONFIRM.QUANLITY && invalidVolume && symbolCode && checkSymbolValid(symbolCode) && <div className='text-danger fs-px-13 text-end'>Invalid volume</div>}
            {title === TITLE_ORDER_CONFIRM.QUANLITY && isMaxOrderVol && !invalidVolume && <div className='text-danger fs-px-13 text-end'>Quantity is exceed max order quantity: {formatNumber(maxOrderVolume?.toString())}</div>}
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

    const _renderPriceInput = useMemo(() => _renderInputControl(TITLE_ORDER_CONFIRM.PRICE, price?.toString(), handleUpperPrice, handleLowerPrice), [price, isOutOfDailyPrice, invalidPrice, isAllowed, orderType])

    const _renderVolumeInput = useMemo(() => _renderInputControl(TITLE_ORDER_CONFIRM.QUANLITY, volume?.toString(), handelUpperVolume, handelLowerVolume), [volume, invalidVolume, isAllowed])

    const _renderForm = () => {
        let existSymbol
        if(symbolCode) {
            existSymbol = symbolListMap.get(symbolCode);
        }
        return (
            <form action="#" className="order-form p-2 border shadow my-3" noValidate={true}>
                <div className='row d-flex align-items-stretch mb-2'>
                    <div className={orderType === tradingModel.OrderType.OP_LIMIT ?
                        'col-md-6 text-center text-uppercase link-btn pointer' : 'col-md-6 text-center text-uppercase pointer'}
                        onClick={() => setOrderType(tradingModel.OrderType.OP_LIMIT)}>
                            Limit
                        </div>
                    <div className={orderType === tradingModel.OrderType.OP_MARKET ?
                        'col-md-6 text-center text-uppercase link-btn pointer' : 'col-md-6 text-center text-uppercase pointer'}
                        onClick={() => {
                            setOrderType(tradingModel.OrderType.OP_MARKET);
                        }} >
                            Market</div>
                </div>
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

                {orderType === tradingModel.OrderType.OP_LIMIT && _renderPriceInput}
                {_renderVolumeInput}
                {orderType === tradingModel.OrderType.OP_MARKET && isEmptyAsk && currentSide === tradingModel.Side.BUY &&
                    <div className='text-danger fs-px-13 text-end'>{MESSAGE_EMPTY_ASK}</div>
                }
                {orderType === tradingModel.OrderType.OP_MARKET && isEmptyBid && currentSide === tradingModel.Side.SELL &&
                    <div className='text-danger fs-px-13 text-end'>{MESSAGE_EMPTY_BID}</div>
                }

                {price !== 0 && volume !== 0 && calcGrossValue(price, volume) > convertNumber(maxOrderValue) &&
                    <div className='text-danger fs-px-13 text-end'>Gross value is exceed max order value: {formatNumber(maxOrderValue?.toString())}</div>
                }

                <div className="border-top">
                    {_renderPlaceButton()}
                    {isDashboard && _renderResetButton()}
                </div>
                {isConfirm && <ConfirmOrder handleCloseConfirmPopup={togglePopup} handleOrderResponse={getStatusOrderResponse} params={paramOrder} ceilingPrice={ceilingPrice} floorPrice={floorPrice} />}
            </form>
        )
    }

    return <div>
        {_renderForm()}
    </div>
}


export default OrderForm