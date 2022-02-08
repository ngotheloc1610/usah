import './Modal.scss';
import '../../pages/Orders/OrderNew/OrderNew.scss';
import { IParamOrder } from '../../interfaces/order.interface';
import { useState } from 'react';
import { wsService } from '../../services/websocket-service';
import * as tmpb from '../../models/proto/trading_model_pb';
import * as tspb from '../../models/proto/trading_service_pb';
import * as rpc from '../../models/proto/rpc_pb';
import ReduxPersist from '../../config/ReduxPersist';
import queryString from 'query-string';
import * as smpb from '../../models/proto/system_model_pb';
import { MODIFY_CANCEL_STATUS, MSG_CODE, MSG_TEXT, OBJ_AUTHEN, RESPONSE_RESULT, SIDE_NAME, TITLE_CONFIRM } from '../../constants/general.constant';
import { formatNumber, formatCurrency } from '../../helper/utils';
import { IAuthen } from '../../interfaces';
import CurrencyInput from 'react-currency-masked-input';
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
    const [volumeModify, setVolumeModify] = useState(params.volume);
    const [priceModify, setPriceModify] = useState(params.price);

    const handleTradingPin = (event: any) => {
        setTradingPin(event.target.value);
    }

    const handleVolumeModify = (event: any) => {
        const onlyNumberVolumeChange = event.target.value.replaceAll(/[^0-9]/g, "");
        if (onlyNumberVolumeChange > Number(params.volume)) {
            setVolumeModify(formatNumber(params.volume));
            return;
        }
        setVolumeModify(onlyNumberVolumeChange);
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
                        // Get status modify or cancel order response
                        handleStatusModifyCancel(MODIFY_CANCEL_STATUS.success)
                    }
                    tmp = RESPONSE_RESULT.success;
                } else {
                    if (handleStatusModifyCancel) {
                        // Get status modify or cancel order response
                        handleStatusModifyCancel(MODIFY_CANCEL_STATUS.error)
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
                        // Get status modify or cancel order response
                        handleStatusModifyCancel(MODIFY_CANCEL_STATUS.success);
                    }
                    tmp = RESPONSE_RESULT.success;
                } else {
                    if (handleStatusModifyCancel) {
                        // Get status modify or cancel order response
                        handleStatusModifyCancel(MODIFY_CANCEL_STATUS.error);
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

    const _disableBtnConfirm = () => {
        let isDisable = true;
        let isConditionPrice = Number(priceModify) > 0;
        let isConditionVolume = Number(volumeModify.replaceAll(',', '')) > 0;
        let isChangePriceOrModify = Number(params.volume) !== Number(volumeModify) || Number(params.price) !== Number(priceModify);
        let isInvalidTradingPin = tradingPin.trim() === '';
        if (isModify) {
            isDisable = isConditionPrice && isConditionVolume && (!isInvalidTradingPin) && isChangePriceOrModify;
        }
        if (isCancel) {
            isDisable = !isInvalidTradingPin;
        }
        return isDisable;
    }
    const _renderConfirmOrder = (title: string, value: string) => (
        <tr>
            <td className='text-left w-150'><b>{title}</b></td>
            <td className='text-left w-90'></td>
            <td className='text-end'>
                {(title === 'Volume' && isModify) ?
                <CurrencyInput type="text" className="m-100" decimalscale="{0}" thousandseparator="{true}"
                               onChange={handleVolumeModify} value={formatNumber(volumeModify.replaceAll(',',''))} />
                    : (title === 'Price' && isModify) ?
                <CurrencyInput type="text" className="m-100" decimalscale="{2}" thousandseparator="{true}"
                               onChange={(e, maskedVal) => {setPriceModify(+maskedVal)}} value={formatCurrency(priceModify.toString())}/>
                    : value}</td>
        </tr>
    )

    const _renderBtnConfirmModifyCancelOrder = () => (
        <div className="d-flex justify-content-around">
            <button className="btn btn-primary" disabled={!_disableBtnConfirm()} onClick={sendOrder}>CONFIRM</button>
            <button className="btn btn-light" onClick={() => handleCloseConfirmPopup(false)}>DISCARD</button>
        </div>
    );
    const _renderBtnConfirmOrder = () => (
        <button className='btn btn-primary' onClick={sendOrder} disabled={tradingPin.trim() === ''}>Place</button>
    )
    const _renderListConfirm = () => (
        <div>
            <table className='w-354'>
                <tbody>
                    {_renderConfirmOrder('Ticker', `${params.tickerCode} - ${params.tickerName}`)}
                    {_renderConfirmOrder('Volume', `${formatNumber(params.volume.toString())}`)}
                    {_renderConfirmOrder('Price', `${formatCurrency(params.price.toString())}`)}
                    {_renderConfirmOrder('Value ($)', `${formatCurrency((Number(volumeModify.replaceAll(',', '')) * Number(priceModify)).toFixed(2).toString())}`)}
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
            <div className="box d-flex">
                    {isModify ? TITLE_CONFIRM['modify'] : isCancel ? TITLE_CONFIRM['cancel'] : TITLE_CONFIRM['newOrder']}
                    <span className="close-icon" onClick={() => handleCloseConfirmPopup(false)}>x</span>
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