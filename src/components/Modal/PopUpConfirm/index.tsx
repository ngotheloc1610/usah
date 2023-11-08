import { useEffect, useState } from 'react';
import moment from 'moment';
import { Button, Modal } from 'react-bootstrap';

import { wsService } from '../../../services/websocket-service';
import * as smpb from '../../../models/proto/system_model_pb';
import * as tmpb from '../../../models/proto/trading_model_pb';
import * as tspb from '../../../models/proto/trading_service_pb';
import * as rpc from '../../../models/proto/rpc_pb';

import { ACCOUNT_ID, MSG_CODE, MSG_TEXT, RESPONSE_RESULT, TEAM_CODE, TIME_OUT_CANCEL_RESPONSE_DEFAULT } from '../../../constants/general.constant';
import { IListOrderModifyCancel } from '../../../interfaces/order.interface';
import { TYPE_ORDER_RES } from '../../../constants/order.constant';
import { MESSAGE_ERROR, CANCEL_SUCCESSFULLY } from '../../../constants/message.constant';

import './PopUpConfirm.scss';

interface IPropsConfirm {
    handleCloseConfirmPopup: (value: boolean) => void;
    totalOrder: number;
    listOrder: IListOrderModifyCancel[];
    handleOrderResponse: (value: number, content: string, typeOrderRes: string, msgCode: number) => void;
    handleOrderCancelId?: (orderId: string) => void;
    handleOrderCancelIdResponse?: (orderId: string) => void;
}

const flagMsgCode = window.globalThis.flagMsgCode;

const PopUpConfirm = (props: IPropsConfirm) => {
    const { handleCloseConfirmPopup, totalOrder, listOrder, handleOrderResponse, handleOrderCancelId, handleOrderCancelIdResponse } = props;

    const tradingServicePb: any = tspb;
    const tradingModelPb: any = tmpb;
    const systemModelPb: any = smpb;
    const rProtoBuff: any = rpc;

    const [isDisableConfirmBtn, setIsDisableConfirmBtn] = useState(false);
    const [teamPassword, setTeamPassword] = useState('');
    const [isHiddenPassword, setIsHiddenPassword] = useState(true);

    const debugLogFlag = window.globalThis.debugLogFlag;

    const teamCode = sessionStorage.getItem(TEAM_CODE) || '';
    const accountId = sessionStorage.getItem(ACCOUNT_ID) || ''

    useEffect(() => {
        const multiCancelOrder = wsService.getCancelSubject().subscribe(resp => {
            debugLogFlag && console.log("Received cancel all order response at: ", `${moment().format('YYYY-MM-DD HH:mm:ss')}.${moment().millisecond()}`);
            let tmp = 0;
            let msgText = resp[MSG_TEXT];
            if (resp?.orderList?.length > 1) {
                const listOrderCancel = resp?.orderList
                let msgCode = resp[MSG_CODE]
                if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                    const idx = listOrderCancel.findIndex(item => item.msgCode === systemModelPb.MsgCode.MT_RET_AUTH_ACCOUNT_INVALID)
                    if(idx >= 0) {
                        tmp = RESPONSE_RESULT.error;
                        msgText = MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_AUTH_ACCOUNT_INVALID);
                        msgCode = listOrderCancel[idx].msgCode
                    } else {
                        tmp = RESPONSE_RESULT.success;
                    }
                } else if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID) {
                    tmp = RESPONSE_RESULT.error;
                    msgText = MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID);
                } else if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_FORWARD_EXT_SYSTEM) {
                    tmp = RESPONSE_RESULT.success;
                    msgText = CANCEL_SUCCESSFULLY;
                }else {
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, msgText, TYPE_ORDER_RES.Cancel, msgCode);
            } else if (resp?.orderList?.length === 1) {
                const order = resp?.orderList[0];
                if (order?.msgCode === systemModelPb.MsgCode.MT_RET_OK) {
                    tmp = RESPONSE_RESULT.success;
                } else if (order?.msgCode === systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID) {
                    tmp = RESPONSE_RESULT.error;
                    msgText = MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID);
                } else if (order?.msgCode === systemModelPb.MsgCode.MT_RET_FORWARD_EXT_SYSTEM) {
                    tmp = RESPONSE_RESULT.success;
                    msgText = CANCEL_SUCCESSFULLY;
                }else {
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, msgText, TYPE_ORDER_RES.Cancel, order?.msgCode);
            } else {
                tmp = RESPONSE_RESULT.error;
                handleOrderResponse(tmp, msgText, TYPE_ORDER_RES.Cancel, resp[MSG_CODE]);
                listOrder?.forEach(order => {
                    if (handleOrderCancelIdResponse) {
                        handleOrderCancelIdResponse(order?.orderId);
                    }
                })
            }
            debugLogFlag && console.log("Finised process toast messages at: ", `${moment().format('YYYY-MM-DD HH:mm:ss')}.${moment().millisecond()}`)
            handleCloseConfirmPopup(false);
            setIsDisableConfirmBtn(false);
        });

        return () => {
            multiCancelOrder.unsubscribe();
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const sendRes = () => {
        let accountId = sessionStorage.getItem(ACCOUNT_ID) || '';
        prepareMessageCancelAll(accountId);
    }

    const prepareMessageCancelAll = (accountId: string) => {
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let cancelOrder = new tradingServicePb.CancelOrderRequest();
            cancelOrder.setHiddenConfirmFlg(false);
            listOrder.forEach(item => {
                if (handleOrderCancelId) {
                    handleOrderCancelId(item?.orderId);
                }

                // after timeOutCancelOrder, if don't receive cancel response => auto stop loading
                const timeOutCancelOrder = window.globalThis.timeOutCancelResponse ? 
                            window.globalThis.timeOutCancelResponse : TIME_OUT_CANCEL_RESPONSE_DEFAULT;
                setTimeout(() => {
                    if (handleOrderCancelIdResponse) {
                        handleOrderCancelIdResponse(item?.orderId || '');
                    }
                }, timeOutCancelOrder)
                let order = new tradingModelPb.Order();
                order.setOrderId(item.orderId);
                order.setAmount(`${item.amount}`);
                order.setPrice(`${item.price}`);
                order.setUid(item.uid);
                order.setSymbolCode(item.symbolCode);
                order.setOrderType(item.orderType);
                order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
                order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
                order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
                order.setSide(item.side);
                order.setSubmittedId(accountId);

                if(flagMsgCode) {
                    order.setMsgCode(systemModelPb.MsgCode.MT_RET_FORWARD_EXT_SYSTEM);
                }

                cancelOrder.addOrder(order);
            });

            // TODO: Need flag ON/OFF to check password team
            cancelOrder.setTeamCode(teamCode);
            cancelOrder.setTeamPassword(teamPassword);

            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.CANCEL_ORDER_REQ);
            rpcMsg.setPayloadData(cancelOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            debugLogFlag && console.log("Send request cancel all order at: ", `${moment().format('YYYY-MM-DD HH:mm:ss')}.${moment().millisecond()}`);
            setIsDisableConfirmBtn(true);
        }
    }

    const handleTeamPassword = (event: any) => {
        setTeamPassword(event.target.value);
    }

    const _disableBtnConfirm = () => {
        const idx = listOrder.findIndex((item) => item.uid.toString() !== accountId)
        if(idx >= 0) {
            return teamPassword === ''
        } 
        return isDisableConfirmBtn
    }

    const checkShowInputTeamPW = () => {
        const checkTeamCode = teamCode && teamCode !== 'null'
        const idx = listOrder.findIndex((item) => item.uid.toString() !== accountId)
        return checkTeamCode && idx >= 0
    }

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            sendRes();
        }
    }

    return <>
        <Modal show={true} onHide={() => { handleCloseConfirmPopup(false) }}>
            <Modal.Header closeButton style={{ background: "var(--bg-dark)", color: "#fff" }}>
                <Modal.Title>
                    <span className='h5'>Cancel All Confirmation</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ marginTop: '10px', marginBottom: '10px' }}>
            <div className='fs-18 fw-600 text-center'>Are you sure <span className="text-danger">Cancel</span> All Order?</div>

            <div className="row" style={{marginTop: '10px'}}>
                <div className="col-10 fs-18 text-center">
                    Total order you have selected
                </div>
                <div className="col-2 fs-18">
                    {totalOrder}
                </div>
            </div>
            {checkShowInputTeamPW() && (
                <div className='mt-2 d-flex px-3 mt-1'>
                    <div className='lh-lg pt-1 ps-3 pe-0'><b>Team ID {teamCode}</b></div>
                    <div className='ms-3 w-50 position-relative'>
                        <input className='d-block w-100 border border-1 rounded-pill py-2 pd-pass'
                            value={teamPassword}
                            type={isHiddenPassword ? 'password' : 'text'}
                            onChange={handleTeamPassword}
                            onKeyUp={handleKeyUp}
                            placeholder='Password' 
                            autoComplete='new-password'
                        />
                        <i className={`bi ${isHiddenPassword ? 'bi-eye-fill' : 'bi-eye-slash'} opacity-50 pad-12 cf-pw-icon`} 
                            onClick={() => setIsHiddenPassword(!isHiddenPassword)}
                        />
                    </div>
                </div>
            )}
            </Modal.Body>
            <Modal.Footer className='justify-content-center'>
                <Button variant="secondary" onClick={() => { handleCloseConfirmPopup(false) }}>
                    DISCARD
                </Button>
                {/* TODO: Need flag ON/OFF to check password team */}
                <Button variant="primary" disabled={_disableBtnConfirm()} onClick={() => sendRes()}>
                    CONFIRM
                </Button>
            </Modal.Footer>
        </Modal>
    </>;
}
export default PopUpConfirm;