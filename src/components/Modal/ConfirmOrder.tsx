import './Modal.scss'
import '../../pages/Orders/OrderNew/OrderNew.scss'
import { IParamOrder } from '../../interfaces/order.interface'
import { useState } from 'react'
import { wsService } from '../../services/websocket-service'
import * as tmpb from '../../models/proto/trading_model_pb';
import * as tspb from '../../models/proto/trading_service_pb';
import * as rpc from '../../models/proto/rpc_pb';
import ReduxPersist from '../../config/ReduxPersist';
import queryString from 'query-string';
import * as smpb from '../../models/proto/system_model_pb';
import { RESPONSE_RESULT } from '../../constants/general.constant'
import { formatNumber } from '../../helper/utils'
interface IConfirmOrder {
    handleCloseConfirmPopup: (value: boolean) => void;
    handleOrderResponse: (value: number, content: string) => void;
    params: IParamOrder
}

const ConfirmOrder = (props: IConfirmOrder) => {
    const tradingServicePb: any = tspb;
    const tradingModelPb: any = tmpb;
    const rProtoBuff: any = rpc;
    const { handleCloseConfirmPopup, params, handleOrderResponse } = props;
    const [currentSide, setCurrentSide] = useState(params.side);
    const [tradingPin, setTradingPin] = useState('');
    const [isValidOrder, setIsValidOrder] = useState(false);
    const handleTradingPin = (event: any) => {
        setTradingPin(event.target.value);
        setIsValidOrder(event.target.value !== '');
    }

    const getOrderType = () => {
        if (params.side === '1') {
            return tradingModelPb.OrderType.OP_BUY;
        }
        return tradingModelPb.OrderType.OP_SELL;
    }

    const prepareMessagee = (accountId: string) => {
        const uid = accountId;
        let wsConnected = wsService.getWsConnected();
        const systemModelPb: any = smpb;
        if (wsConnected) {
            let currentDate = new Date();
            let singleOrder = new tradingServicePb.NewOrderSingleRequest();
            singleOrder.setSecretKey(tradingPin);
            singleOrder.setHiddenConfirmFlg(params.confirmationConfig);

            let order = new tradingModelPb.Order();
            order.setAmount(`${params.volume}`);
            order.setPrice(`${params.price}`);
            order.setUid(uid);
            order.setSymbolCode(params.tickerId);
            order.setOrderType(getOrderType());
            order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
            order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
            order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);

            singleOrder.setOrder(order);
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.NEW_ORDER_SINGLE_REQ);
            rpcMsg.setPayloadData(singleOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            // note
            // wsService.sendMessage(rpcMsg.serializeBinary());
            wsService.getOrderSubject().subscribe(resp => {
                let tmp = 0;
                if (resp['msgCode'] === systemModelPb.MsgCode.MT_RET_OK) {
                    tmp = RESPONSE_RESULT.success;
                } else {
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, resp['msgText']);
            })
            handleCloseConfirmPopup(true);
        }
    }

    const sendOrder = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string | any = '';
        if (objAuthen.access_token) {
            accountId = objAuthen.account_id;
            ReduxPersist.storeConfig.storage.setItem('objAuthen', JSON.stringify(objAuthen));
            prepareMessagee(accountId);
            return;
        }
        ReduxPersist.storeConfig.storage.getItem('objAuthen').then(resp => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                prepareMessagee(accountId);
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID;
                prepareMessagee(accountId);
                return;
            }
        });
    }

    const _renderTradingPin = () => (
        <tr className='h-100'>
            <td className='text-left '><b>Trading PIN</b></td>
            <td></td>
            <td><input type="password" value={tradingPin} onChange={handleTradingPin} /></td>
        </tr>
    )

    const _renderConfirmOrder = (title: string, value: string) => (
        <tr>
            <td className='text-left w-150'><b>{title}</b></td>
            <td className='text-left w-90'>:</td>
            <td className='text-end'>{value}</td>
        </tr>
    )

    const _renderListConfirm = () => (
        <div>
            <table style={{ width: '354px' }}>
                <tbody>
                    {_renderConfirmOrder('Ticker', `${params.tickerCode} - ${params.tickerName}`)}
                    {_renderConfirmOrder('Volume', `${formatNumber(params.volume.toString())}`)}
                    {_renderConfirmOrder('Price', `${formatNumber(params.price.toString())}`)}
                    {_renderConfirmOrder('Value ($)', `${formatNumber((params.volume * params.price).toFixed(2).toString())}`)}
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
            <span className='fs-18'><b>Would you like to place order</b></span> &nbsp;
            <span className={currentSide === '1' ? 'order-type text-danger' : 'order-type text-success'}><b>
                {currentSide === '1' ? 'buy' : 'sell'}
            </b></span> &nbsp;
            <span className='fs-18'><b>?</b></span>
        </div>
    )

    const _renderTamplate = () => (
        <div>
            <div className="box">
                <div>
                    New order confirmation
                    <span className="close-icon" onClick={() => handleCloseConfirmPopup(false)}>x</span>
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