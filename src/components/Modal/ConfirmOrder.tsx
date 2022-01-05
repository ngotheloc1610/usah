import './Modal.scss'
import '../../pages/Orders/OrderNew/OrderNew.scss'
import { IParamOrder } from '../../interfaces/order.interface'
import { useState } from 'react'
import { wsService } from '../../services/websocket-service'
import * as tmpb from '../../models/proto/trading_model_pb';
import * as tspb from '../../models/proto/trading_service_pb';
import * as rpc from '../../models/proto/rpc_pb';

interface IConfirmOrder {
    handleCloseConfirmPopup: () => void;
    params: IParamOrder
}

const ConfirmOrder = (props: IConfirmOrder) => {
    const tradingServicePb: any = tspb;
    const tradingModelPb: any = tmpb;
    const rProtoBuff: any = rpc;
    const { handleCloseConfirmPopup, params } = props;
    const [currentSide, setCurrentSide] = useState(params.side);
    const [tradingPin, setTradingPin] = useState('');
    const [isValidOrder, setIsValidOrder] = useState(false);

    const handleTradingPin = (event: any) => {
        setTradingPin(event.target.value);
        setIsValidOrder(event.target.value !== '');
    }

    const sendOrder = () => {
        const uid = process.env.REACT_APP_TRADING_ID;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let singleOrder = new tradingServicePb.NewOrderSingleRequest();
            singleOrder.setSecretKey(tradingPin);
            singleOrder.setHiddenConfirmFlg(params.confirmationConfig);
            let order = new tradingModelPb.Order();
            order.setAmount(params.volume);
            order.setPrice(params.side);
            order.setUid(uid);
            singleOrder.setOrder(order);
            console.log(singleOrder);
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.NEW_ORDER_SINGLE_REQ);
            rpcMsg.setPayloadData(singleOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            handleCloseConfirmPopup();
        }
    }

    const _renderTradingPin = () => (
        <tr className='h-100'>
            <td><b>Trading Pin</b></td>
            <td></td>
            <td><input type="password" value={tradingPin} onChange={handleTradingPin} /></td>
        </tr>
    )

    const _renderConfirmOrder = (title: string, value: string) => (
        <tr>
            <td className='text-left w-150'><b>{title}</b></td>
            <td className='text-left w-90'>:</td>
            <td className='text-left'>{value}</td>
        </tr>
    )

    const _renderListConfirm = () => (
        <div>
            <table style={{ width: '354px' }}>
                <tbody>
                    {_renderConfirmOrder('Ticker', `${params.tickerCode} - ${params.tickerName}`)}
                    {_renderConfirmOrder('Volume', `${params.volume}`)}
                    {_renderConfirmOrder('Price', `${params.price}`)}
                    {_renderConfirmOrder('Value', `${params.volume * params.price}`)}
                    {_renderTradingPin()}
                </tbody>
            </table>
            <div style={{ marginTop: '30px' }}>
                <button className='btn-primary-custom' style={{ width: '100px' }} onClick={sendOrder} disabled={!isValidOrder}>Place</button>
            </div>
        </div>
    )

    const _renderHeaderFormConfirm = () => (
        <div>
            <span className='fs-18'><b>Would you like to place order</b></span> &nbsp; &nbsp; &nbsp;
            <span className={currentSide === '1' ? 'order-type text-danger' : 'order-type text-success'}><b>
                {currentSide === '1' ? 'buy' : 'sell'}
            </b></span>
        </div>
    )

    const _renderTamplate = () => (
        <div>
            <div className="box">
                <div>
                    Confirm order
                    <span className="close-icon" onClick={handleCloseConfirmPopup}>x</span>
                </div>
            </div>
            <div className='content text-center'>
                {_renderHeaderFormConfirm()}
                <div className='table-content'>
                    {_renderListConfirm()}
                </div>
            </div>
        </div>
    )

    return <div className="popup-box">
        {_renderTamplate()}
    </div>
}

export default ConfirmOrder