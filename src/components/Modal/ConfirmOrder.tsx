import './Modal.scss';
import '../../pages/Orders/OrderNew/OrderNew.scss';
import { IParamOrderModifyCancel } from '../../interfaces/order.interface';
import { useEffect, useState } from 'react';
import { wsService } from '../../services/websocket-service';
import * as tmpb from '../../models/proto/trading_model_pb';
import * as tspb from '../../models/proto/trading_service_pb';
import * as rpc from '../../models/proto/rpc_pb';
import * as smpb from '../../models/proto/system_model_pb';
import * as psbp from '../../models/proto/pricing_service_pb';
import { ACCOUNT_ID, CURRENCY, LIST_TICKER_INFO, MAX_ORDER_VOLUME, MIN_ORDER_VALUE, MODIFY_CANCEL_STATUS, MSG_CODE, MSG_TEXT, ORDER_TYPE, RESPONSE_RESULT, SIDE, SIDE_NAME, TITLE_CONFIRM, TITLE_ORDER_CONFIRM } from '../../constants/general.constant';
import { formatNumber, formatCurrency, calcPriceIncrease, calcPriceDecrease, convertNumber, handleAllowedInput } from '../../helper/utils';
import { TYPE_ORDER_RES } from '../../constants/order.constant';
import NumberFormat from 'react-number-format';
import { MESSAGE_ERROR } from '../../constants/message.constant';
import { toast } from 'react-toastify';
import { Button, Modal } from 'react-bootstrap';

interface IConfirmOrder {
    handleCloseConfirmPopup: (value: boolean) => void;
    handleOrderResponse: (value: number, content: string, typeOrderRes: string, msgCode: number) => void;
    handleStatusModifyCancel?: (value: boolean) => void;
    params: IParamOrderModifyCancel;
    isModify?: boolean;
    isCancel?: boolean;
}

const ConfirmOrder = (props: IConfirmOrder) => {
    const tradingServicePb: any = tspb;
    const tradingModelPb: any = tmpb;
    const pricingServicePb: any = psbp;
    const rProtoBuff: any = rpc;
    const { handleCloseConfirmPopup, params, handleOrderResponse, isModify, isCancel, handleStatusModifyCancel } = props;
    const [currentSide, setCurrentSide] = useState(params.side);
    const [volumeModify, setVolumeModify] = useState(params.volume);
    const [priceModify, setPriceModify] = useState(params.price);
    const [tickSize, setTickSize] = useState(0.01);
    const [lotSize, setLotSize] = useState(100);
    const [invalidPrice, setInvalidPrice] = useState(false);
    const [invalidVolume, setInvalidVolume] = useState(false);
    const [outOfPrice, setOutOfPrice] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);
    const [isDisableInput, setIsDisableInput] = useState(false);

    const symbols = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const minOrderValue = localStorage.getItem(MIN_ORDER_VALUE);

    useEffect(() => {
        const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]')
        const tickSize = tickerList.find(item => item.symbolCode === params.tickerCode)?.tickSize;
        const lotSize = tickerList.find(item => item.symbolCode === params.tickerCode)?.lotSize;
        setTickSize(convertNumber(tickSize));
        setLotSize(convertNumber(lotSize));
    }, [])

    const handleVolumeModify = (valueVolume: string) => {
        const symbolInfo = symbols.find(o => o?.symbolCode === params?.tickerCode)
        const lotSize = symbolInfo?.ceiling ? symbolInfo?.lotSize : '';
        const onlyNumberVolumeChange = valueVolume.replaceAll(/[^0-9]/g, "");
        if (lotSize && convertNumber(lotSize) !== 0) {
            setInvalidVolume(convertNumber(valueVolume) % convertNumber(lotSize) !== 0);
        }
        convertNumber(onlyNumberVolumeChange) > convertNumber(params.volume) ? setIsDisableInput(true) : setIsDisableInput(false);
        setVolumeModify(onlyNumberVolumeChange);
    }

    const prepareMessageeModify = (accountId: string) => {
        const uid = accountId;
        let wsConnected = wsService.getWsConnected();
        const systemModelPb: any = smpb;
        if (wsConnected) {
            let currentDate = new Date();
            let modifyOrder = new tradingServicePb.ModifyOrderRequest();
            modifyOrder.setHiddenConfirmFlg(params.confirmationConfig);

            let order = new tradingModelPb.Order();
            order.setOrderId(params.orderId);
            order.setAmount(`${volumeModify}`);
            order.setPrice(`${priceModify}`);
            order.setUid(uid);
            order.setSymbolCode(params.tickerCode);
            order.setSide(params.side);
            order.setOrderType(params.orderType);
            order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
            order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
            order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
            order.setSubmittedId(uid);
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
                handleOrderResponse(tmp, resp[MSG_TEXT], TYPE_ORDER_RES.Modify, resp[MSG_CODE]);
            });
            handleCloseConfirmPopup(false);
        }
    }

    const callSigleOrderRequest = (accountId: string) => {
        const uid = accountId;
        let wsConnected = wsService.getWsConnected();
        const systemModelPb: any = smpb;
        const maxOrderVolume = localStorage.getItem(MAX_ORDER_VOLUME) || '0';
        if (convertNumber(maxOrderVolume) < convertNumber(params.volume)) {
            const errMess = MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_EXCEED_MAX_ORDER_VOLUME);
            toast.error(`${errMess}: ${formatNumber(maxOrderVolume)}`);
            handleCloseConfirmPopup(true);
            return;
        }

        if (wsConnected) {
            let currentDate = new Date();
            let singleOrder = new tradingServicePb.NewOrderSingleRequest();
            singleOrder.setHiddenConfirmFlg(params.confirmationConfig);

            let order = new tradingModelPb.Order();
            order.setAmount(`${params.volume}`);
            order.setPrice(`${params.price.toFixed(2)}`);
            order.setUid(uid);
            order.setSymbolCode(params.tickerCode);
            order.setSide(params.side);
            order.setOrderType(params.orderType);
            order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
            order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
            order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
            order.setCurrencyCode(CURRENCY.usd);
            order.setSubmittedId(uid);
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
                handleOrderResponse(tmp, resp[MSG_TEXT], TYPE_ORDER_RES.Order, resp[MSG_CODE]);
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
            cancelOrder.setHiddenConfirmFlg(params.confirmationConfig);

            let order = new tradingModelPb.Order();
            order.setOrderId(params.orderId);
            order.setAmount(`${volumeModify}`);
            order.setPrice(`${priceModify}`);
            order.setUid(uid);
            order.setSymbolCode(params.tickerCode);
            order.setSide(params.side);
            order.setOrderType(params.orderType)
            order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
            order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
            order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
            order.setSubmittedId(uid);
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
                        unSubscribeQuoteEvent();
                    }
                    tmp = RESPONSE_RESULT.success;
                } else {
                    if (handleStatusModifyCancel) {
                        // Get status modify or cancel order response
                        handleStatusModifyCancel(MODIFY_CANCEL_STATUS.error);
                    }
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, resp[MSG_TEXT], TYPE_ORDER_RES.Cancel, resp[MSG_CODE]);
            });
            handleCloseConfirmPopup(false);
        }
    }

    const unSubscribeQuoteEvent = () => {
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            unsubscribeQuoteReq.addSymbolCode(params.tickerCode);
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendOrder = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        if (isCancel) {
            prepareMessageeCancel(accountId);
        }
        else if (isModify) {
            if (convertNumber(calValue()) < convertNumber(minOrderValue)) {
                return;
            }
            prepareMessageeModify(accountId);
        } else {
            callSigleOrderRequest(accountId);
        }
        return;
    }


    const handleUpperVolume = () => {
        const currentVol = convertNumber(volumeModify);
        let nerwVol = currentVol + lotSize;
        setVolumeModify(nerwVol.toString());

    }

    const handleLowerVolume = () => {
        const currentVol = convertNumber(volumeModify);
        if (currentVol <= lotSize) {
            return;
        }
        const nerwVol = currentVol - lotSize;
        setVolumeModify(nerwVol.toString());
    }

    useEffect(() => {
        if((priceModify*100)%(tickSize*100) === 0) {
            setInvalidPrice(false)
        }
    }, [priceModify])

    const handleUpperPrice = () => {
        const symbolInfo = symbols.find(o => o?.symbolCode === params?.tickerCode);
        const ceilingPrice = symbolInfo?.ceiling ? symbolInfo?.ceiling : '';
        const floorPrice = symbolInfo?.floor ? symbolInfo?.floor : '';
        const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
        const currentPrice = convertNumber(priceModify.toString());
        const newPrice = calcPriceIncrease(currentPrice, tickSize, decimalLenght);
        setOutOfPrice(false)
        if (ceilingPrice) {
            if (convertNumber(ceilingPrice) < newPrice) {
                setPriceModify(convertNumber(ceilingPrice));
                return;
            }
        }

        if (floorPrice) {
            if (convertNumber(floorPrice) > newPrice) {
                setPriceModify(convertNumber(floorPrice));
                return;
            }
        }
        setPriceModify(newPrice);
    }

    const handleLowerPrice = () => {
        const symbolInfo = symbols.find(o => o?.symbolCode === params?.tickerCode)
        const floorPrice = symbolInfo?.floor ? symbolInfo?.floor : '';
        const ceilingPrice = symbolInfo?.ceiling ? symbolInfo?.ceiling : '';
        const currentPrice = convertNumber(priceModify.toString());
        const decimalLenght = tickSize.toString().split('.')[1] ? tickSize.toString().split('.')[1].length : 0;
        const newPrice = calcPriceDecrease(currentPrice, tickSize, decimalLenght);
        setOutOfPrice(false)
        if (floorPrice) {
            if (convertNumber(floorPrice) > newPrice) {
                setPriceModify(convertNumber(floorPrice));
                return;
            }
        }

        if (ceilingPrice) {
            if (convertNumber(ceilingPrice) < newPrice) {
                setPriceModify(convertNumber(ceilingPrice));
                return;
            }
        }

        setPriceModify(newPrice);
    }

    const _renderConfirmOrder = (title: string, value: string) => (
        <div className='row'>
            <div className='col-6'><b>{title}</b></div>
            {title === TITLE_ORDER_CONFIRM.SIDE ?
                <div className={`text-end ${value.toLowerCase() === SIDE_NAME.buy ? 'text-danger text-uppercase col-6' : 'text-success text-uppercase col-6'}`}>{value}</div>
                : <div className="text-end text-uppercase col-6">{value}</div>}
        </div>
    )

    const _renderOrderType = () => (
        <tr className='mt-2'>
            <td className='text-left w-150'><b>Order type</b></td>
            <td className='text-end pt-1 pb-2'>
                {ORDER_TYPE.get(params.orderType)}
            </td>
        </tr>
    )

    const onChangePrice = (value: string) => {
        const symbolInfo = symbols.find(o => o?.symbolCode === params?.tickerCode)
        const ceilingPrice = symbolInfo?.ceiling ? symbolInfo?.ceiling : '';
        const floorPrice = symbolInfo?.floor ? symbolInfo?.floor : '';
        const tickSize = symbolInfo?.tickSize ? symbolInfo?.tickSize : 1;
        setOutOfPrice(+value < +floorPrice || +value > +ceilingPrice);
        const newTickSize = Math.round(convertNumber(tickSize) * Math.pow(10, 2));
        const newPrice = Math.round(+value * Math.pow(10, 2));
        setInvalidPrice(newPrice % newTickSize !== 0);
        setPriceModify(+value);
    }

    const handleKeyDown = (e) => {
        e.key !== 'Delete' ? setIsAllowed(true) : setIsAllowed(false);
    }
    const btnDisableVolume = () => {
        const isVolumeValue = convertNumber(volumeModify) >= convertNumber(params.volume)
        return isVolumeValue ? true : false
    }
    const _renderInputControl = (title: string, value: string, handleUpperValue: () => void, handleLowerValue: () => void) => (
        <div className='row'>
            <div className='text-left col-5'>
                <b>{title === TITLE_ORDER_CONFIRM.PRICE && params.orderType === tradingModelPb.OrderType.OP_MARKET ? 'Market price' : title}</b>
            </div>
            <div className='text-end col-7'>
                {(isModify && title === TITLE_ORDER_CONFIRM.QUANLITY) ? <>
                    <div className="border mb-1 d-flex">
                        <div className="flex-grow-1 py-1 px-2 d-flex justify-content-center align-items-end flex-column" onKeyDown={handleKeyDown}>
                            <NumberFormat type="text" className="m-100 form-control text-end border-0 p-0 fs-5 lh-1 fw-600 outline"
                                decimalScale={0} thousandSeparator=","
                                isAllowed={(e) => handleAllowedInput(e.value, isAllowed)}
                                onValueChange={(e) => handleVolumeModify(e.value)} value={formatNumber(volumeModify.replaceAll(',', ''))} />
                        </div>
                        <div className="border-start d-flex flex-column">
                            <button disabled={btnDisableVolume()} type="button" className="btn border-bottom btn-increase flex-grow-1" onClick={handleUpperValue}>+</button>
                            <button type="button" className="btn btn-increase flex-grow-1" onClick={handleLowerValue}>-</button>
                        </div>
                    </div>
                    {invalidVolume && title === TITLE_ORDER_CONFIRM.QUANLITY && <div className='text-danger'>Invalid volume</div>}
                    {isDisableInput && title === TITLE_ORDER_CONFIRM.QUANLITY && <div className='text-danger text-nowrap'>Quantity is exceed order quantity</div>}
                </>
                    : (title === TITLE_ORDER_CONFIRM.QUANLITY ? convertNumber(value) : formatCurrency(value))
                }
            </div>
        </div>
    )
    const _disableBtnConfirm = () => {
        let isDisable = true;
        let isConditionPrice = convertNumber(priceModify.toString()) > 0;
        let isConditionVolume = convertNumber(volumeModify) > 0;
        let isChangePriceOrModify = convertNumber(params.volume) !== convertNumber(volumeModify) || convertNumber(params.price.toString()) !== convertNumber(priceModify.toString());
        if (isModify) {
            if (convertNumber(calValue()) < convertNumber(minOrderValue)) {
                return false;
            }
            isDisable = isConditionPrice && isConditionVolume && isChangePriceOrModify;
        }
        return isDisable;
    }

    const _renderBtnConfirmModifyCancelOrder = () => (
        <div className="d-flex justify-content-around">
            <button className="btn btn-primary" onClick={sendOrder} disabled={!_disableBtnConfirm() || invalidPrice || invalidVolume || outOfPrice || isDisableInput}>CONFIRM</button>
            <button className="btn btn-light" onClick={() => handleCloseConfirmPopup(false)}>DISCARD</button>
        </div>
    );

    const _renderBtnConfirmOrder = () => (
        <button disabled={convertNumber(calValue()) === 0} className='btn btn-primary' onClick={sendOrder}>Place</button>
    )

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const calValue = () => {
        if (isModify) return (convertNumber(volumeModify) * convertNumber(priceModify.toString())).toFixed(2).toString();
        return (convertNumber(params.volume) * convertNumber(params.price)).toFixed(2);
    }

    const _renderErrorMinValue = () => (
        <>
            <div className='text-danger text-end'>{`The order is less than USD ${formatNumber(minOrderValue || '')}. `}</div>
            <div className='text-danger text-end'>Kindly revise the number of shares.</div>
        </>
    )

    const _renderListConfirm = () => (
        <div>
            <table className='w-354'>
                <tbody>
                    {_renderConfirmOrder(TITLE_ORDER_CONFIRM.TICKER, `${params.tickerCode} - ${params.tickerName}`)}
                    {_renderOrderType()}
                    {(isModify || isCancel) && _renderConfirmOrder(TITLE_ORDER_CONFIRM.SIDE, `${getSideName(params.side)}`)}
                    {_renderInputControl(TITLE_ORDER_CONFIRM.QUANLITY, `${formatNumber(volumeModify)}`, handleUpperVolume, handleLowerVolume)}
                    {_renderInputControl(TITLE_ORDER_CONFIRM.PRICE, params.price.toString(), handleUpperPrice, handleLowerPrice)}
                    {params.orderType === tradingModelPb.OrderType.OP_LIMIT && _renderConfirmOrder(`${TITLE_ORDER_CONFIRM.VALUE} ($)`, `${formatCurrency(calValue())}`)}
                    {params.orderType === tradingModelPb.OrderType.OP_MARKET &&
                        <>
                            <tr className='mt-2'>
                                <td className='text-left w-150'><b className='text-truncate'>Indicative Gross Value</b></td>
                                <td className={`text-end `}>{formatCurrency(calValue())}</td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <div className='fs-px-12 text-danger text-left'>(*Market prices may change)</div>
                                    <div className='fs-px-12 text-danger text-left'>Note: Balance unexecuted quantity will continue queue in market with Last Done price </div>
                                </td>
                            </tr>
                        </>
                    }
                </tbody>
            </table>
            {isModify && (convertNumber(calValue()) < convertNumber(minOrderValue)) && _renderErrorMinValue()}
            <div className='mt-30'>
                {!isModify && !isCancel && _renderBtnConfirmOrder()}
                {(isModify || isCancel) && _renderBtnConfirmModifyCancelOrder()}
            </div>
        </div>
    )

    const _renderContentFormConfirm = () => (
        <>
            <div className='row'>
                <div className='col-5'><b>Symbol Code</b></div>
                <div className='col-7 text-end'>{`${params.tickerName} (${params.tickerCode})`}</div>
            </div>
            <div className='row'>
                <div className='col-6'><b>Order Type</b></div>
                <div className='col-6 text-end'>{ORDER_TYPE.get(params.orderType)}</div>
            </div>
            {_renderConfirmOrder(TITLE_ORDER_CONFIRM.SIDE, `${getSideName(params.side)}`)}
            {_renderInputControl(TITLE_ORDER_CONFIRM.QUANLITY, `${formatNumber(volumeModify)}`, handleUpperVolume, handleLowerVolume)}
            {_renderInputControl(TITLE_ORDER_CONFIRM.PRICE, params.price.toString(), handleUpperPrice, handleLowerPrice)}
            {params.orderType === tradingModelPb.OrderType.OP_LIMIT && _renderConfirmOrder(`${TITLE_ORDER_CONFIRM.VALUE} ($)`, `${formatCurrency(calValue())}`)}
            {params.orderType === tradingModelPb.OrderType.OP_MARKET &&
                <>
                    <tr className='mt-2'>
                        <td className='text-left w-150'><b className='text-truncate'>Indicative Gross Value</b></td>
                        <td className={`text-end `}>{formatCurrency(calValue())}</td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div className='fs-px-12 text-left'>(*Market prices may change)</div>
                            <div className='fs-px-12 text-left'>Note: Balance unexecuted quantity will continue queue in market with Last Done price </div>
                        </td>
                    </tr>
                </>
            }
        </>
    )

    const _renderTamplate = () => (
        <Modal show={true} onHide={() => { handleCloseConfirmPopup(false) }}>
            <Modal.Header style={{ background: "#16365c", color: "#fff" }}>
                <Modal.Title style={{ background: "#16365c", color: "#fff" }}>
                    <span className='h5'>{isModify ? TITLE_CONFIRM['modify'] : isCancel ? TITLE_CONFIRM['cancel'] : TITLE_CONFIRM['newOrder']}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ marginTop: '10px', marginBottom: '10px' }}>{_renderContentFormConfirm()}</Modal.Body>
            <Modal.Footer className='justify-content-center'>
                {!isModify && !isCancel &&
                    <>
                        <Button variant="secondary" onClick={() => { handleCloseConfirmPopup(false) }}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={sendOrder} disabled={convertNumber(calValue()) === 0}>
                            Place
                        </Button>
                    </>
                }
                {(isModify || isCancel) &&
                    <>
                        <Button variant="secondary" onClick={() => { handleCloseConfirmPopup(false) }}>
                            DISCARD
                        </Button>
                        <Button variant="primary" onClick={sendOrder}
                            disabled={!_disableBtnConfirm() || invalidPrice || invalidVolume || outOfPrice || isDisableInput}>
                            CONFIRM
                        </Button>
                    </>
                }
            </Modal.Footer>
        </Modal>
    )

    return <div className="popup-box">
        {_renderTamplate()}
    </div>
}

export default ConfirmOrder