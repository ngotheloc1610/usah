import { useEffect, useState } from 'react';
import { IAskAndBidPrice, IParamOrder, ISymbolQuote, ITickerInfo } from '../../interfaces/order.interface';
import '../../pages/Orders/OrderNew/OrderNew.scss';
import ConfirmOrder from '../Modal/ConfirmOrder';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { LIST_TICKER_INFO, MESSAGE_TOAST, ORDER_TYPE_NAME, RESPONSE_RESULT } from '../../constants/general.constant';
import * as tdpb from '../../models/proto/trading_model_pb';
import { calcPriceDecrease, calcPriceIncrease, formatCurrency, formatNumber } from '../../helper/utils';
import CurrencyInput from 'react-currency-masked-input';

toast.configure()
interface IOrderForm {
    isOrderBook?: boolean;
    tickerCode?: string;
    currentTicker: ITickerInfo;
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

const defaultProps = {
    currentTicker: {},
    isDashboard: false
}

const OrderForm = (props: IOrderForm) => {
    const { currentTicker, isDashboard, messageSuccess, symbolCode, side, quoteInfo } = props;
    const [tickerName, setTickerName] = useState('');
    const tradingModel: any = tdpb;
    const [currentSide, setCurrentSide] = useState(tradingModel.Side.SELL);
    const [isConfirm, setIsConfirm] = useState(false);
    const [validForm, setValidForm] = useState(false);
    const [paramOrder, setParamOrder] = useState(defaultData);
    const [lotSize, setLotSize] = useState(100);
    const [tickSize, setTickSize] = useState(0.01)
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(0);
    const [statusOrder, setStatusOrder] = useState(0);
    const [invalidPrice, setInvalidPrice] = useState(false);
    const [invalidVolume, setInvalidVolume] = useState(false);
    const [floorPrice, setFloorPrice] = useState(0);
    const [ceilingPrice, setCeilingPrice] = useState(0);

    useEffect(() => {
        if (symbolCode) {
            handleSetPrice();
            handleSetVolume();
            handleSetSide();
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
            setPrice(Number(floor))
            setVolume(Number(lotSize))
        }
    }, [symbolCode])

    useEffect(() => {
        if (side) {
            setCurrentSide(side);
        }
    }, [side])

    useEffect(() => {
        if (quoteInfo) {
            if (!isNaN(Number(quoteInfo.price))) {
                setPrice(Number(quoteInfo.price));
            } else {
                setPrice(floorPrice);
            }

            if (!isNaN(Number(quoteInfo.volume))) {
                setVolume(Number(quoteInfo.volume));
            } else {
                setVolume(lotSize);
            }
        }
    }, [quoteInfo])

    const handleSetPrice = () => {
        currentTicker.lastPrice === '-' ? setPrice(0) : setPrice(Number(currentTicker.lastPrice?.replaceAll(',', '')));
        setValidForm(currentTicker.lastPrice !== undefined);
    }

    const handleSetVolume = () => {
        if (isDashboard) {
            currentTicker.lotSize === '-' ? setVolume(0) : setVolume(Number(currentTicker.lotSize));
        } else {
            currentTicker.volume === '-' ? setVolume(0) : setVolume(Number(currentTicker.volume));
        }
        setValidForm(currentTicker.lotSize !== undefined);
    }

    const handleSetSide = () => {
        setCurrentSide(Number(currentTicker.side) === Number(tradingModel.Side.BUY)
            ? tradingModel.Side.BUY : tradingModel.Side.SELL);
        setValidForm(currentTicker.side !== undefined);
    }

    const _rendetMessageSuccess = (message: string) => {
        // To handle when order success then update new data without having to press f5
        messageSuccess(MESSAGE_TOAST.SUCCESS_PLACE);
        return <div>{toast.success(MESSAGE_TOAST.SUCCESS_PLACE)}</div>
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
        if (newPrice > ceilingPrice) {
            newPrice = ceilingPrice;
        }
        setPrice(newPrice);
        const temp = Math.round(Number(newPrice) * Math.pow(10, 2));
        const tempTickeSize = Math.round(tickSize * Math.pow(10, 2));
        setInvalidPrice(temp % tempTickeSize !== 0);
        setValidForm(newPrice > 0 && volume > 0);
    }

    const handleLowerPrice = () => {
        const currentPrice = Number(price);
        if (currentPrice <= tickSize) {
            setPrice(tickSize);
            setValidForm(volume > 0);
            return;
        }
        const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
        let newPrice = calcPriceDecrease(currentPrice, tickSize, decimalLenght);
        if (newPrice < floorPrice) {
            newPrice = floorPrice;
        }
        setPrice(newPrice);
        const temp = Math.round(Number(newPrice) * Math.pow(10, 2));
        const tempTickeSize = Math.round(tickSize * Math.pow(10, 2));
        setInvalidPrice(temp % tempTickeSize !== 0);
        setValidForm(newPrice > 0 && volume > 0);
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

    const togglePopup = (isOrder: boolean) => {
        if (isOrder) {
            setPrice(0);
            setVolume(0);
            setValidForm(false);
        } else {
            if (Number(currentTicker.lastPrice) <= 0 || lotSize <= 0) {
                setValidForm(false);
            } else {
                setValidForm(true);
            }
        }
        setIsConfirm(false);
    }

    const handlePlaceOrder = () => {
        const param = {
            tickerCode: symbolCode || '',
            tickerName: currentTicker.tickerName,
            orderType: ORDER_TYPE_NAME.limit,
            volume: volume.toString(),
            price: price,
            side: currentSide,
            confirmationConfig: false,
            tickerId: currentTicker.symbolId?.toString()
        }
        setParamOrder(param);
        setIsConfirm(true);
    }

    const disableButtonPlace = (): boolean => {
        const isDisable = (Number(price) === 0 || Number(volume) === 0 || tickerName === '');
        return isDisable;
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
        const convertValueToNumber = Number(value.replaceAll(',', ''));
        if (convertValueToNumber > 0 && convertValueToNumber) {
            setVolume(convertValueToNumber);
            setInvalidVolume(convertValueToNumber % lotSize !== 0)
        }
    }

    const handleChangePrice = (value: string) => {
        if (Number(value) > ceilingPrice) {
            setPrice(ceilingPrice);
        } else if (Number(value) < floorPrice) {
            setPrice(floorPrice);
        } else {
            setPrice(Number(value))
        }
        const temp = Math.round(Number(value) * Math.pow(10, 2));
        const tempTickeSize = Math.round(tickSize * Math.pow(10, 2));
        setInvalidPrice(temp % tempTickeSize !== 0);
    }


    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => {
        return <>
        <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
            <div className="flex-grow-1 py-1 px-2">
                <label className="text text-secondary">{title}</label>
                <CurrencyInput decimalscale={title.toLocaleLowerCase() === 'price' ? 2 : 0} type="text" className="form-control text-end border-0 p-0 fs-5 lh-1 fw-600" 
                thousandseparator="{true}" value={value} placeholder=""
                onChange={title.toLocaleLowerCase() === 'price' ? (e: any) => handleChangePrice(e?.target.value) : (e: any) => handleChangeVolume(e.target.value)} />
            </div>
            <div className="border-start d-flex flex-column">
                <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperValue}>+</button>
                <button type="button" className="btn px-2 py-1 flex-grow-1" onClick={handleLowerValue}>-</button>
            </div>
        </div>
        {/* <div>
            {title.toLocaleLowerCase() === 'price' && <>
                {invalidPrice && <span className='text-danger'>Invalid Price</span>}
            </>}
            {title.toLocaleLowerCase() === 'volume' && <>
                {invalidVolume && <span className='text-danger'>Invalid volume</span>}
            </>}
        </div> */}
    </>
    }

    const _renderPlaceButton = () => (
        <button className="btn btn-placeholder btn-primary-custom d-block fw-bold text-white mb-1 w-100"
            disabled={disableButtonPlace()}
            onClick={handlePlaceOrder} >Place</button>
    )

    const _renderResetButton = () => (
        <button className="btn btn-reset btn-outline-secondary d-block fw-bold mb-1 w-100"
            onClick={resetFormNewOrder}
        >Reset</button>
    )

    const _renderForm = () => (
        <form action="#" className="order-form p-2 border shadow my-3">
            <div className="order-btn-group d-flex align-items-stretch mb-2">
                {_renderButtonSideOrder(currentSide, 'btn-buy', 'Sell', tradingModel.Side.SELL, 'selected', '')}
                {_renderButtonSideOrder(currentSide, 'btn-sell', 'Buy', tradingModel.Side.BUY, '', 'selected')}
            </div>
            <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                <label className="text text-secondary">Ticker</label>
                <div className="fs-18 mr-3">
                    <b>{symbolCode ? symbolCode : ''}</b>
                </div>
            </div>


            {_renderInputControl('Price', formatCurrency(price.toString()), handleUpperPrice, handleLowerPrice)}
            {_renderInputControl('Volume', formatNumber(volume.toString()), handelUpperVolume, handelLowerVolume)}

            <div className="border-top">
                {_renderPlaceButton()}
                {isDashboard && _renderResetButton()}
            </div>
            {isConfirm && <ConfirmOrder handleCloseConfirmPopup={togglePopup} handleOrderResponse={getStatusOrderResponse} params={paramOrder} />}
        </form>
    )

    return <div>
        {_renderForm()}
    </div>
}

OrderForm.defaultProps = defaultProps;

export default OrderForm