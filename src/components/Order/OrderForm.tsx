import { useEffect, useMemo, useState } from 'react';
import { IAskAndBidPrice, IParamOrder, IParamOrderModifyCancel, ISymbolQuote } from '../../interfaces/order.interface';
import '../../pages/Orders/OrderNew/OrderNew.scss';
import ConfirmOrder from '../Modal/ConfirmOrder';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { LIST_TICKER_INFO, MESSAGE_TOAST, ORDER_TYPE_NAME, RESPONSE_RESULT, TITLE_ORDER_CONFIRM } from '../../constants/general.constant';
import * as tdpb from '../../models/proto/trading_model_pb';
import { calcPriceDecrease, calcPriceIncrease, convertNumber, formatCurrency, formatNumber, handleAllowedInput } from '../../helper/utils';
import { TYPE_ORDER_RES } from '../../constants/order.constant';
import NumberFormat from 'react-number-format';

toast.configure()
interface IOrderForm {
    isOrderBook?: boolean;
    tickerCode?: string;
    isDashboard: boolean;
    symbolCode?: string;
    symbolQuote?: ISymbolQuote;
    quoteInfo?: IAskAndBidPrice;
    side?: number;
    messageSuccess: (item: string) => void;
}

const defaultData: IParamOrder = {
    tickerCode: '',
    tickerName: '',
    orderType: '',
    volume: '',
    price: 0,
    side: '',
    confirmationConfig: false,
    tickerId: ''
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
    const { isDashboard, messageSuccess, symbolCode, side, quoteInfo } = props;
    const [tickerName, setTickerName] = useState('');
    const tradingModel: any = tdpb;
    const [currentSide, setCurrentSide] = useState(tradingModel.Side.SELL);
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
    const [floorPrice, setFloorPrice] = useState(0);
    const [ceilingPrice, setCeilingPrice] = useState(0);
    const [isShowNotiErrorPrice, setIsShowNotiErrorPrice] = useState(false);

    const [statusCancel, setStatusCancel] = useState(0);
    const [statusModify, setStatusModify] = useState(0);

    useEffect(() => {
        if (side) {
            setCurrentSide(side);
        }
    }, [side])

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
    }, [price, volume])

    useEffect(() => {
        if (symbolCode) {
            setIsShowNotiErrorPrice(false);
            setInvalidVolume(false);
            setInvalidPrice(false);
            setTickerName(symbolCode);
            const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const ticker = tickerList.find(item => item.symbolCode === symbolCode);
            const tickSize = ticker?.tickSize;
            const lotSize = ticker?.lotSize;
            const floor = ticker?.floor;
            setFloorPrice(Number(ticker?.floor));
            setCeilingPrice(Number(ticker?.ceiling));
            setTickSize(Number(tickSize));
            setLotSize(Number(lotSize));
            setPrice(Number(floor));
            setVolume(convertNumber(lotSize));
        } else {
            setPrice(0);
            setVolume(0);
        }

    }, [symbolCode])

    useEffect(() => {
        if (quoteInfo) {
            const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
            const ticker = tickerList.find(item => item.symbolCode === symbolCode);
            const lotSize = ticker?.lotSize;
            const floor = ticker?.floor;
            const price = convertNumber(quoteInfo.price) === 0 ? floor : convertNumber(quoteInfo.price)
            const volume = convertNumber(quoteInfo.volume) === 0 ? lotSize : convertNumber(quoteInfo.volume)
            setPrice(price);
            setVolume(volume);
        }
    }, [quoteInfo])

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

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const handleSide = (value: string) => {
        setCurrentSide(value);
    }

    const handelUpperVolume = () => {
        const currentVol = Number(volume);
        const nerwVol = currentVol + lotSize;
        setVolume(nerwVol);
        setInvalidVolume(nerwVol % lotSize !== 0);
        setValidForm(price > 0 && nerwVol > 0);
    }

    const handelLowerVolume = () => {
        const currentVol = Number(volume);
        if (currentVol <= lotSize) {
            setVolume(lotSize);
            return;
        }
        const nerwVol = currentVol - lotSize;
        setVolume(nerwVol);
        setInvalidVolume(nerwVol % lotSize !== 0);
        setValidForm(price > 0 && nerwVol > 0);
    }

    const handleUpperPrice = () => {
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

    const getStatusOrderResponse = (value: number, content: string, typeStatusRes: string) => {
        if (typeStatusRes === TYPE_ORDER_RES.Order && statusOrder === 0) {
            setStatusOrder(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
            </>
        }
        if (typeStatusRes === TYPE_ORDER_RES.Modify && statusModify === 0) {
            setStatusModify(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
            </>
        }
        if (typeStatusRes === TYPE_ORDER_RES.Cancel && statusCancel === 0) {
            setStatusCancel(value);
            return <>
                {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content, typeStatusRes)}
                {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
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
        return isDisable || isShowNotiErrorPrice || invalidVolume || invalidPrice;
    }

    const _renderButtonSideOrder = (side: string, className: string, title: string, sideHandle: string, positionSelected1: string, positionSelected2: string) => (
        <button type="button"
            className={side === tradingModel.Side.SELL ? `btn ${className} text-white flex-grow-1 p-2 text-center ${positionSelected1}` : `btn ${className} text-white flex-grow-1 p-2 text-center ${positionSelected2}`}
            onClick={() => handleSide(sideHandle)}>
            <span className="fs-5 text-uppercase">{title}</span>
        </button>
    )

    const resetFormNewOrder = () => {
        setPrice(floorPrice);
        setVolume(lotSize);
    }
    const handleChangeVolume = (value: string) => {
        const volume = convertNumber(value);
        if ((volume || volume === 0) && volume > -1) {
            setVolume(volume);
            setInvalidVolume(volume % lotSize !== 0 || volume < 1);
        }
    }

    const handleChangePrice = (value: string) => {
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
        <div className='text-danger'>Order price is out of day's price range</div>
    )

    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => {
        return <>
            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                <div className="flex-grow-1 py-1 px-2">
                    <label className="text text-secondary">{title}</label>
                    <NumberFormat decimalScale={title === TITLE_ORDER_CONFIRM.PRICE ? 2 : 0} type="text" className="form-control text-end border-0 p-0 fs-5 lh-1 fw-600"
                        isAllowed={(values) => handleAllowedInput(values)}
                        thousandSeparator="," value={title === TITLE_ORDER_CONFIRM.PRICE ? formatCurrency(value?.replaceAll(',', '')) : formatNumber(value?.replaceAll(',', ''))}
                        onValueChange={title === TITLE_ORDER_CONFIRM.PRICE ? (e: any) => handleChangePrice(e.value) : (e: any) => handleChangeVolume(e.value)} />
                </div>
                <div className="border-start d-flex flex-column">
                    <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperValue}>+</button>
                    <button type="button" className="btn px-2 py-1 flex-grow-1" onClick={handleLowerValue}>-</button>
                </div>
            </div>
            {isShowNotiErrorPrice && title === TITLE_ORDER_CONFIRM.PRICE && _renderNotiErrorPrice()}
            <div>
                {title === TITLE_ORDER_CONFIRM.PRICE && invalidPrice && <span className='text-danger'>Invalid Price</span>}
            </div>
            {title === TITLE_ORDER_CONFIRM.QUANLITY &&  invalidVolume && <span className='text-danger'>Invalid volume</span>}
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

    const _renderPriceInput = useMemo(() => _renderInputControl(TITLE_ORDER_CONFIRM.PRICE, formatCurrency(price.toString()), handleUpperPrice, handleLowerPrice), [price, isShowNotiErrorPrice, invalidPrice])

    const _renderVolumeInput = useMemo(() => _renderInputControl(TITLE_ORDER_CONFIRM.QUANLITY, formatNumber(volume.toString()), handelUpperVolume, handelLowerVolume), [volume, invalidVolume])

    const _renderForm = () => {
        const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        const existSymbol = symbols.find(symbol => symbol.symbolCode === symbolCode);
        return (
            <form action="#" className="order-form p-2 border shadow my-3" noValidate={true}>
                <div className="order-btn-group d-flex align-items-stretch mb-2">
                    {_renderButtonSideOrder(currentSide, 'btn-buy', 'Sell', tradingModel.Side.SELL, 'selected', '')}
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