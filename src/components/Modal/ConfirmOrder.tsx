import './Modal.css'
import '../../pages/Orders/OrderNew/OrderNew.css'
import { IParamOrder } from '../../interfaces/order.interface'
import { useState } from 'react'
import { wsService } from '../../services/websocket-service'
import * as tmpb from '../../models/proto/trading_model_pb';
import * as tspb from '../../models/proto/trading_service_pb';
import * as rpc from '../../models/proto/rpc_pb';
import { DATA_ASK_VOLUME } from '../../mocks'

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

    const _renderListConfirm = () => (
        <div>
            <table style={{ width: '354px' }}>
                <tbody>
                    <tr>
                        <td className='text-left w-150'><b>Ticker</b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.tickerCode} - {params.tickerName}</td>
                    </tr>
                    <tr>
                        <td className='text-left w-150'><b>Volume</b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.volume}</td>
                    </tr>
                    <tr>
                        <td className='text-left w-150'><b>Price</b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.price}</td>
                    </tr>
                    <tr>
                        <td className='text-left w-150'><b>Value &nbsp;&nbsp; <span>($)</span></b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.volume * params.price}</td>
                    </tr>
                    <tr className='h-100'>
                        <td><b>Trading Pin</b></td>
                        <td></td>
                        <td><input type="password" value={tradingPin} onChange={handleTradingPin} /></td>
                    </tr>
                </tbody>
            </table>
            <div style={{marginTop: '30px'}}>
                <button className='btn-primary-custom' style={{ width: '100px' }} onClick={sendOrder} disabled={!isValidOrder}>Place</button>
            </div>
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
                <div>
                    <span className='fs-18'><b>Would you like to place order</b></span> &nbsp; &nbsp; &nbsp;
                    <span className={currentSide === '1' ? 'order-type text-success' : 'order-type text-danger'}><b>
                        {currentSide === '1' ? 'buy' : 'sell'}
                    </b></span>
                </div>
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