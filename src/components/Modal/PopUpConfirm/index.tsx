
import { ACCOUNT_ID, MSG_CODE, MSG_TEXT, RESPONSE_RESULT, TIME_OUT_CANCEL_RESPONSE_DEFAULT } from '../../../constants/general.constant';
import { wsService } from '../../../services/websocket-service';
import * as smpb from '../../../models/proto/system_model_pb';
import * as tmpb from '../../../models/proto/trading_model_pb';
import * as tspb from '../../../models/proto/trading_service_pb';
import { IListOrderModifyCancel } from '../../../interfaces/order.interface';
import * as rpc from '../../../models/proto/rpc_pb';
import { TYPE_ORDER_RES } from '../../../constants/order.constant';
import { useEffect } from 'react';
import './PopUpConfirm.scss';
import { Button, Modal } from 'react-bootstrap';
import { MESSAGE_ERROR } from '../../../constants/message.constant';
import moment from 'moment';

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

    useEffect(() => {
        const multiCancelOrder = wsService.getCancelSubject().subscribe(resp => {
            console.log("Received cancel all order response at: ", `${moment().format('YYYY-MM-DD HH:mm:ss')}.${moment().millisecond()}`);
            let tmp = 0;
            let msgText = resp[MSG_TEXT];
            if (resp?.orderList?.length > 1) {
                if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                    tmp = RESPONSE_RESULT.success;
                } else if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID) {
                    tmp = RESPONSE_RESULT.error;
                    msgText = MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID);
                } else {
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, msgText, TYPE_ORDER_RES.Cancel, resp[MSG_CODE]);
            } else if (resp?.orderList?.length === 1) {
                const order = resp?.orderList[0];
                if (order?.msgCode === systemModelPb.MsgCode.MT_RET_OK) {
                    tmp = RESPONSE_RESULT.success;
                } else if (order?.msgCode === systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID) {
                    tmp = RESPONSE_RESULT.error;
                    msgText = MESSAGE_ERROR.get(systemModelPb.MsgCode.MT_RET_UNKNOWN_ORDER_ID);
                } else {
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, msgText, TYPE_ORDER_RES.Cancel, order?.msgCode);
            } else {
                tmp = RESPONSE_RESULT.error;
                handleOrderResponse(tmp, msgText, TYPE_ORDER_RES.Cancel, resp[MSG_CODE]);
            }
            
            handleCloseConfirmPopup(false);
            console.log("Finised process cancel order response at: ", `${moment().format('YYYY-MM-DD HH:mm:ss')}.${moment().millisecond()}`);
        });

        return () => {
            multiCancelOrder.unsubscribe();
        }

    }, [])

    const sendRes = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        prepareMessageCancelAll(accountId);
    }

    const prepareMessageCancelAll = (accountId: string) => {
        const uid = accountId;
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
                order.setUid(uid);
                order.setSymbolCode(item.symbolCode);
                order.setOrderType(item.orderType);
                order.setExecuteMode(tradingModelPb.ExecutionMode.MARKET);
                order.setOrderMode(tradingModelPb.OrderMode.REGULAR);
                order.setRoute(tradingModelPb.OrderRoute.ROUTE_WEB);
                order.setSide(item.side);
                order.setSubmittedId(uid);

                if(flagMsgCode) {
                    order.setMsgCode(systemModelPb.MsgCode.MT_RET_FORWARD_EXT_SYSTEM);
                }

                cancelOrder.addOrder(order);
            });
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.CANCEL_ORDER_REQ);
            rpcMsg.setPayloadData(cancelOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            console.log("Send request cancel all order at: ", `${moment().format('YYYY-MM-DD HH:mm:ss')}.${moment().millisecond()}`);
            if (handleCloseConfirmPopup) {
                handleCloseConfirmPopup(false);
            }
        }
    }
    return <>
        <Modal show={true} onHide={() => { handleCloseConfirmPopup(false) }}>
            <Modal.Header closeButton style={{ background: "#16365c", color: "#fff" }}>
                <Modal.Title>
                    <span className='h5'>Cancel All Confirmation</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ marginTop: '10px', marginBottom: '10px' }}>
            <div className='fs-18 fw-600 text-center'>Are you sure <span className="text-danger">Cancel</span> All Order?</div>

            <div className="row" style={{marginTop: '20px'}}>
                <div className="col-10 fs-18 text-center">
                    Total order you have selected
                </div>
                <div className="col-2 fs-18">
                    {totalOrder}
                </div>
            </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-center'>
                <Button variant="secondary" onClick={() => { handleCloseConfirmPopup(false) }}>
                    DISCARD
                </Button>
                <Button variant="primary" onClick={sendRes}>
                    CONFIRM
                </Button>
            </Modal.Footer>
        </Modal>
    </>;
}
export default PopUpConfirm;