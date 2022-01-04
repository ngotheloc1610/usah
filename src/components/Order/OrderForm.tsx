import { useState } from 'react'
import '../../pages/Orders/OrderNew/OrderNew.css'
import ConfirmOrder from '../Modal/ConfirmOrder';

const defaultData = {
    tickerCode: '',
    tickerName: '',
    orderType: '',
    volume: 0,
    price: 0,
    side: '',
    confirmationConfig: false
} 

const OrderForm = () => {

    const [currentSide, setCurrentSide] = useState('1');
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(0);
    const [isConfirm, setIsConfirm] = useState(false);
    const [validForm, setValidForm] = useState(false);

    const [paramOrder, setParamOrder] = useState(defaultData);

    const handleSide = (value: string) => {
        setCurrentSide(value);
    }

    const handlePrice = (event: any) => {
        setPrice(event.target.value);
    }

    const handleVolume = (event: any) => {
        setVolume(event.target.value);
    }

    const handelUpperVolume = () => {
        const currentVol = volume;
        const nerwVol = currentVol + 1;
        setVolume(nerwVol);
        setValidForm(price > 0 && nerwVol > 0);
    }

    const handelLowerVolume = () => {
        const currentVol = volume;
        if (currentVol === 0) {
            setVolume(0);
            return;
        }
        const nerwVol = currentVol - 1;
        setVolume(nerwVol);
        setValidForm(price > 0 && nerwVol > 0);
    }

    const handleUpperPrice = () => {
        const currentPrice = price;
        const newPrice = currentPrice + 1;
        setPrice(newPrice);
        setValidForm(newPrice > 0 && volume > 0);
    }

    const handleLowerPrice = () => {
        const currentPrice = price;
        if (currentPrice === 0) {
            setPrice(0);
            return;
        }
        const newPrice = currentPrice - 1;
        setPrice(newPrice);
        setValidForm(newPrice > 0 && volume > 0);
    }

    const togglePopup = () => {
        setIsConfirm(false);
    }

    const handlePlaceOrder = () => {
        const param = {
            tickerCode: 'AAPL',
            tickerName: 'Apple Inc',
            orderType: 'limit',
            volume: volume,
            price: price,
            side: currentSide,
            confirmationConfig: false
        }
        setParamOrder(param);
        setIsConfirm(true);
    }

    const _renderForm = () => (
        <form action="#" className="order-form p-2 border shadow my-3">

            <div className="order-btn-group d-flex align-items-stretch mb-2">

                <button type="button" 
                    className={currentSide === '2' ? 'btn btn-buy text-white flex-grow-1 p-2 text-center selected' : 'btn btn-buy text-white flex-grow-1 p-2 text-center'} 
                    onClick={() => handleSide('2')}>
                    <span className="fs-5 text-uppercase">Sell</span>
                </button>

                <button type="button" 
                    className={currentSide === '2' ? 'btn btn-sell text-white flex-grow-1 p-2 px-2 text-center' : 'btn btn-sell text-white flex-grow-1 p-2 px-2 text-center selected'}
                    onClick={() => handleSide('1')}>
                    <span className="fs-5 text-uppercase">Buy</span>
                </button>

            </div>

            <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                <label className="text text-secondary">Ticker</label>
                <div className="fs-5">AAPL</div>
            </div>

            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                <div className="flex-grow-1 py-1 px-2">
                    <label className="text text-secondary">Price</label>
                    <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value={price} placeholder="" 
                    onChange={handlePrice} />
                </div>
                <div className="border-start d-flex flex-column">
                    <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handleUpperPrice}>+</button>
                    <button type="button" className="btn px-2 py-1 flex-grow-1" onClick={handleLowerPrice}>-</button>
                </div>
            </div>

            <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                <div className="flex-grow-1 py-1 px-2">
                    <label className="text text-secondary">Volume</label>
                    <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1" value={volume} placeholder="" 
                    onChange={handleVolume} />
                </div>
                <div className="border-start d-flex flex-column">
                    <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1" onClick={handelUpperVolume}>+</button>
                    <button type="button" className="btn px-2 py-1 flex-grow-1" onClick={handelLowerVolume}>-</button>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-secondary">Owned Volume</div>
                <div><strong>10,000</strong></div>
            </div>
            <div className="border-top">
                <button className="btn btn-placeholder btn-primary-custom d-block fw-bold text-white mb-1 w-100" data-bs-toggle="modal" data-bs-target="#confirmModal"
                onClick={handlePlaceOrder} disabled={!validForm} >Place</button>
            </div>

            {isConfirm && <ConfirmOrder handleClose={togglePopup} params={paramOrder} />}

        </form>
    )

    return <div>{_renderForm()}</div>
}

export default OrderForm