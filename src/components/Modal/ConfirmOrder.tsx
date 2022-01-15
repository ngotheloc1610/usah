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
import { MSG_CODE, MSG_TEXT, OBJ_AUTHEN, RESPONSE_RESULT, SIDE_NAME, TITLE_CONFIRM } from '../../constants/general.constant'
import { formatNumber } from '../../helper/utils'
import { use } from 'i18next'
import { IAuthen } from '../../interfaces'
interface IConfirmOrder {
    handleCloseConfirmPopup: (value: boolean) => void;
    handleOrderResponse: (value: number, content: string) => void;
    handleStatusModifyCancel?: (value: boolean) => void;
    params: IParamOrder;
    isModify?: boolean;
    isCancel?: boolean;
}

const ConfirmOrder = (props: IConfirmOrder) => {
    const tradingServicePb: any = tspb;
    const tradingModelPb: any = tmpb;
    const rProtoBuff: any = rpc;
    const { handleCloseConfirmPopup, params, handleOrderResponse, isModify, isCancel, handleStatusModifyCancel } = props;
    const [currentSide, setCurrentSide] = useState(params.side);
    const [tradingPin, setTradingPin] = useState('');
    const [isValidOrder, setIsValidOrder] = useState(false);
    const [volumeModify, setVolumeModify] = useState(params.volume);
    const [priceModify, setPriceModify] = useState(params.price);
    const handleTradingPin = (event: any) => {
        setTradingPin(event.target.value);
        setIsValidOrder(event.target.value !== '');
    }

    const handleVolumeModify = (event: any) => {
        if (Number(event.target.value) > params.volume) {
            setVolumeModify(params.volume);
            return;
        }
        setVolumeModify(event.target.value);
    }

    const handlePriceModify = (event: any) => {
        setPriceModify(event.target.value);
    }

    const prepareMessageeModify = (accountId: string) => {
        const uid = accountId;
        let wsConnected = wsService.getWsConnected();
        const systemModelPb: any = smpb;
        if (wsConnected) {
            let currentDate = new Date();
            let modifyOrder = new tradingServicePb.ModifyOrderRequest();
            modifyOrder.setSecretKey(tradingPin);
            modifyOrder.setHiddenConfirmFlg(params.confirmationConfig);

            let order = new tradingModelPb.Order();
            order.setOrderId(params.orderId);
            order.setAmount(`${volumeModify}`);
            order.setPrice(`${priceModify}`);
            order.setUid(uid);
            order.setSymbolCode(params.tickerId);
            order.setOrderType(params.side);
            order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
            order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
            order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
            modifyOrder.addOrder(order);

            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.MODIFY_ORDER_REQ);
            rpcMsg.setPayloadData(modifyOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());

            wsService.sendMessage(rpcMsg.serializeBinary());
            wsService.getModifySubject().subscribe(resp => {
                let tmp = 0;
                if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                    if (handleStatusModifyCancel) {
                        handleStatusModifyCancel(true)
                    }
                    tmp = RESPONSE_RESULT.success;
                } else {
                    if (handleStatusModifyCancel) {
                        handleStatusModifyCancel(false)
                    }
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, resp[MSG_TEXT]);
            });
            handleCloseConfirmPopup(false);
        }
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
            order.setOrderType(params.side);
            order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
            order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
            order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);

            singleOrder.setOrder(order);
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.NEW_ORDER_SINGLE_REQ);
            rpcMsg.setPayloadData(singleOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            wsService.getOrderSubject().subscribe(resp => {
                let tmp = 0;
                if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                    tmp = RESPONSE_RESULT.success;
                } else {
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, resp[MSG_TEXT]);
            });

            handleCloseConfirmPopup(true);
        }
    }
    const prepareMessageeCancel = (accountId: string) => {
        const uid = accountId;
        let wsConnected = wsService.getWsConnected();
        const systemModelPb: any = smpb;
        if (wsConnected) {
            let currentDate = new Date();
            let cancelOrder = new tradingServicePb.CancelOrderRequest();
            cancelOrder.setSecretKey(tradingPin);
            cancelOrder.setHiddenConfirmFlg(params.confirmationConfig);

            let order = new tradingModelPb.Order();
            order.setOrderId(params.orderId);
            order.setAmount(`${volumeModify}`);
            order.setPrice(`${priceModify}`);
            order.setUid(uid);
            order.setSymbolCode(params.tickerId);
            order.setOrderType(params.side);
            order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
            order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
            order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
            cancelOrder.addOrder(order);
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.CANCEL_ORDER_REQ);
            rpcMsg.setPayloadData(cancelOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            wsService.getCancelSubject().subscribe(resp => {
                let tmp = 0;
                if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                    if (handleStatusModifyCancel) {
                        handleStatusModifyCancel(true);
                    }
                    tmp = RESPONSE_RESULT.success;
                } else {
                    if (handleStatusModifyCancel) {
                        handleStatusModifyCancel(false);
                    }
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, resp[MSG_TEXT]);
            });
            handleCloseConfirmPopup(false);
        }
    }


    const sendOrder = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId: string | any = '';
        if (objAuthen.access_token) {
            accountId = objAuthen.account_id;
            ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen));
            if (isCancel) {
                prepareMessageeCancel(accountId);
            }
            else if (isModify) {
                prepareMessageeModify(accountId);
            } else {
                prepareMessagee(accountId);
            }
            return;
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then(resp => {
            if (resp) {
                const obj: IAuthen = JSON.parse(resp);
                accountId = obj.account_id;
                if (isCancel) {
                    prepareMessageeCancel(accountId);
                }
                else if (isModify) {
                    prepareMessageeModify(accountId);
                } else {
                    prepareMessagee(accountId);
                }
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID;
                if (isCancel) {
                    prepareMessageeCancel(accountId);
                }
                else if (isModify) {
                    prepareMessageeModify(accountId);
                } else {
                    prepareMessagee(accountId);
                }
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

    const _checkChangeVolumeOrPrice = () => {
        let isDisable = true;
        if (isModify) {
            isDisable = Number(params.volume) !== Number(volumeModify) || Number(params.price) !== Number(priceModify);
        }
        return isDisable;
    }
    const _renderConfirmOrder = (title: string, value: string) => (
        <tr>
            <td className='text-left w-150'><b>{title}</b></td>
            <td className='text-left w-90'></td>
            <td className='text-end'>
                {(title === 'Volume' && isModify) ?
                    <input type="number" className="m-100" onChange={handleVolumeModify} max={Number(params.volume)} min={0} value={volumeModify} />
                    : (title === 'Price' && isModify) ?
                        <input type="number" className="m-100" width={"100%"} onChange={handlePriceModify} min={0} value={priceModify} />
                        : value}</td>
        </tr>
    )

    const _renderBtnConfirmModifyCancelOrder = () => (
        <div className="d-flex justify-content-around">
            <button className="btn btn-primary" disabled={!_checkChangeVolumeOrPrice()} onClick={sendOrder}>CONFIRM</button>
            <button className="btn btn-light" onClick={() => handleCloseConfirmPopup(false)}>DISCARD</button>
        </div>
    );
    const _renderBtnConfirmOrder = () => (
        <button className='btn-primary-custom w-px-100' onClick={sendOrder} disabled={!isValidOrder}>Place</button>
    )
    const _renderListConfirm = () => (
        <div>
            <table className='w-354'>
                <tbody>
                    {_renderConfirmOrder('Ticker', `${params.tickerCode} - ${params.tickerName}`)}
                    {_renderConfirmOrder('Volume', `${formatNumber(params.volume.toString())}`)}
                    {_renderConfirmOrder('Price', `${formatNumber(params.price.toString())}`)}
                    {_renderConfirmOrder('Value ($)', `${formatNumber((volumeModify * priceModify).toFixed(2).toString())}`)}
                    {_renderTradingPin()}
                </tbody>
            </table>
            <div className='mt-30'>
                {!isModify && !isCancel && _renderBtnConfirmOrder()}
                {(isModify || isCancel) && _renderBtnConfirmModifyCancelOrder()}
            </div>
        </div>
    )

    const _renderHeaderFormConfirm = () => (
        <div>
            <span className='fs-18'>
                {!isModify && !isCancel && <b>Would you like to place order&nbsp;</b>}
                {isCancel && <b>Are you sure to <span className='text-danger'>CANCEL</span> order</b>}
                {isModify && <b>Are you sure to <span className='text-success'>Modify</span> order</b>}
            </span>
            {!isModify && !isCancel && <span className={Number(currentSide) === Number(tradingModelPb.OrderType.OP_BUY) ? 'order-type text-danger' : 'order-type text-success'}><b>
                {Number(currentSide) === Number(tradingModelPb.OrderType.OP_BUY) ? SIDE_NAME.buy : SIDE_NAME.sell}
            </b></span>} &nbsp;
            <span className='fs-18'><b>?</b></span>
        </div>
    )

    const _renderTamplate = () => (
        <div>
            <div className="box">
                <div>
                    {isModify ? TITLE_CONFIRM['modify'] : isCancel ? TITLE_CONFIRM['cancel'] : TITLE_CONFIRM['newOrder']}
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