import { useEffect, useState } from 'react'
import { IParamOrder, ITickerInfo } from '../../interfaces/order.interface';
import '../../pages/Orders/OrderNew/OrderNew.scss'
import ConfirmOrder from '../Modal/ConfirmOrder';
import { toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { ORDER_TYPE_NAME, RESPONSE_RESULT } from '../../constants/general.constant';
import * as tdpb from '../../models/proto/trading_model_pb';
import { formatCurrency, formatNumber } from '../../helper/utils';
import NumberFormat from 'react-number-format';
import CurrencyInput from 'react-currency-masked-input';

toast.configure()
interface IOrderForm {
    isOrderBook?: boolean;
    currentTicker: ITickerInfo;
    isDashboard: boolean;
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
    const { currentTicker, isDashboard, messageSuccess, isOrderBook } = props;
    const [tickerName, setTickerName] = useState(currentTicker.tickerName || '');
    const tradingModel: any = tdpb;
    const [currentSide, setCurrentSide] = useState(Number(currentTicker.side) === Number(tradingModel.OrderType.OP_BUY)
    ? tradingModel.OrderType.OP_BUY : tradingModel.OrderType.OP_SELL);
    const [isConfirm, setIsConfirm] = useState(false);
    const [validForm, setValidForm] = useState(false);
    const [paramOrder, setParamOrder] = useState(defaultData);
    const [tradingUnit, setTradingUnit] = useState(100);
    const [tickerSize, setTickerSize] = useState(0.01)
    const [price, setPrice] = useState(Number(currentTicker.lastPrice?.replaceAll(',', '')));
    const [volume, setVolume] = useState(Number(currentTicker.volume));
    const [statusOrder, setStatusOrder] = useState(0);

    useEffect(() => {
        handleSetPrice();
        handleSetVolume();
        handleSetSide();
        setTickerName(currentTicker.tickerName)
    }, [currentTicker])

    const handleSetPrice = () => {
        setPrice(Number(currentTicker.lastPrice?.replaceAll(',', '')));
        setValidForm(currentTicker.lastPrice !== undefined);
    }
    const handleSetVolume = () => {
        setVolume(Number(currentTicker.volume));
        setValidForm(currentTicker.volume !== undefined);
    }
    const handleSetSide = () => {
        setCurrentSide(Number(currentTicker.side) === Number(tradingModel.OrderType.OP_BUY)
        ? tradingModel.OrderType.OP_BUY : tradingModel.OrderType.OP_SELL);
        setValidForm(currentTicker.side !== undefined);
    }

    const _rendetMessageSuccess = (message: string) => {
        // To handle when order success then update new data without having to press f5
        messageSuccess('Place order successfully');
        return <div>{toast.success('Place order successfully')}</div>
    }

    const _rendetMessageError = (message: string) => (
        <div>{toast.error(message)}</div>
    )

    const handleSide = (value: string) => {
        setCurrentSide(value);
    }

    const handelUpperVolume = () => {
        const currentVol = Number(volume);
        const nerwVol = currentVol + tradingUnit;
        setVolume(nerwVol);
        setValidForm(price > 0 && nerwVol > 0);
    }

    const handelLowerVolume = () => {
        const currentVol = Number(volume);
        if (currentVol <= tradingUnit) {
            setVolume(tradingUnit);
            return;
        }
        const nerwVol = currentVol - tradingUnit;
        setVolume(nerwVol);
        setValidForm(price > 0 && nerwVol > 0);
    }

    const handleUpperPrice = () => {
        const decimalLenght = tickerSize.toString().split('.')[1] ? tickerSize.toString().split('.')[1].length : 0;
        const currentPrice = Number(price);
        const newPrice = Math.round((currentPrice + tickerSize) * Math.pow(10, decimalLenght)) / Math.pow(10, decimalLenght);
        setPrice(newPrice);
        setValidForm(newPrice > 0 && volume > 0);
    }

    const handleLowerPrice = () => {
        const currentPrice = Number(price);
        if (currentPrice <= tickerSize) {
            setPrice(tickerSize);
            setValidForm(volume > 0);
            return;
        }
        const decimalLenght = tickerSize.toString().split('.')[1] ? tickerSize.toString().split('.')[1].length : 0;
        const newPrice = Math.round((currentPrice - tickerSize) * Math.pow(10, decimalLenght)) / Math.pow(10, decimalLenght);
        setPrice(newPrice);
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
            if (Number(currentTicker.lastPrice) <= 0 || tradingUnit <= 0) {
                setValidForm(false);
            } else {
                setValidForm(true);
            }
        }
        setIsConfirm(false);
    }

    const handlePlaceOrder = () => {
        const param = {
            tickerCode: currentTicker.ticker,
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
            className={side === tradingModel.OrderType.OP_SELL ? `btn ${className} text-white flex-grow-1 p-2 text-center ${positionSelected1}` : `btn ${className} text-white flex-grow-1 p-2 text-center ${positionSelected2}`}
            onClick={() => handleSide(sideHandle)}>
            <span className="fs-5 text-uppercase">{title}</span>
        </button>
    )

    const resetFormNewOrder = () => {
        setPrice(0);
        setVolume(0);
        setTickerName('');
    }
    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => (
        <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
            <div className="flex-grow-1 py-1 px-2">
                <label className="text text-secondary">{title}</label>
                <CurrencyInput precision={title.toLocaleLowerCase() === 'price' ? 2 : 0} type="text" className="form-control text-end border-0 p-0 fs-5 lh-1 fw-600" 
                pattern="\d*(\.\d{2})?" inputMode="numeric"
                displayType={'input'} thousandSeparator={true} value={currentTicker.tickerName ? value : 0} placeholder=""
                onChange={title.toLocaleLowerCase() === 'price' ? (e, maskedVal) => {setPrice(+maskedVal)} : (e, maskedVal) => {setVolume(e.target.value.replaceAll(',',''))}} />
            </div>
            <div className="border-start d-flex flex-column">
                <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperValue}>+</button>
                <button type="button" className="btn px-2 py-1 flex-grow-1" onClick={handleLowerValue}>-</button>
            </div>
        </div>
    )

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
                {_renderButtonSideOrder(currentSide, 'btn-buy', 'Sell', tradingModel.OrderType.OP_SELL, 'selected', '')}
                {_renderButtonSideOrder(currentSide, 'btn-sell', 'Buy', tradingModel.OrderType.OP_BUY, '', 'selected')}
            </div>
            <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                <label className="text text-secondary">Ticker</label>
                <div className="fs-18 mr-3">
                    <b>{tickerName ? `${currentTicker.ticker}` : ''}</b>
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