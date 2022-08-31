
import { ACCOUNT_ID, MODIFY_CANCEL_STATUS, MSG_CODE, MSG_TEXT, RESPONSE_RESULT, SIDE } from '../../../constants/general.constant';
import { wsService } from '../../../services/websocket-service';
import * as smpb from '../../../models/proto/system_model_pb';
import * as tmpb from '../../../models/proto/trading_model_pb';
import * as tspb from '../../../models/proto/trading_service_pb';
import * as psbp from '../../../models/proto/pricing_service_pb';
import { IListOrderModifyCancel } from '../../../interfaces/order.interface';
import * as rpc from '../../../models/proto/rpc_pb';
import { TYPE_ORDER_RES } from '../../../constants/order.constant';
import { useEffect } from 'react';
import './PopUpConfirm.scss';

interface IPropsConfirm {
    handleCloseConfirmPopup: (value: boolean) => void;
    totalOrder: number;
    listOrder: IListOrderModifyCancel[];
    handleOrderResponse: (value: number, content: string, typeOrderRes: string, msgCode: number) => void;
    handleStatusCancelAll?: (value: boolean) => void;
}

const PopUpConfirm = (props: IPropsConfirm) => {
    const { handleCloseConfirmPopup, totalOrder, listOrder, handleOrderResponse, handleStatusCancelAll } = props;

    const tradingServicePb: any = tspb;
    const tradingModelPb: any = tmpb;
    const systemModelPb: any = smpb;
    const rProtoBuff: any = rpc;
    const pricingServicePb: any = psbp;

    useEffect(() => {
        const multiCancelOrder = wsService.getCancelSubject().subscribe(resp => {
            let tmp = 0;
            if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                if (handleStatusCancelAll) {
                    // Get status modify or cancel order response
                    handleStatusCancelAll(MODIFY_CANCEL_STATUS.success);
                    unSubscribeQuoteEvent();
                }
                tmp = RESPONSE_RESULT.success;
            } else {
                if (handleStatusCancelAll) {
                    // Get status modify or cancel order response
                    handleStatusCancelAll(MODIFY_CANCEL_STATUS.error)
                }
                tmp = RESPONSE_RESULT.error;
            }
            handleOrderResponse(tmp, resp[MSG_TEXT], TYPE_ORDER_RES.Cancel, resp[MSG_CODE]);
            handleCloseConfirmPopup(false);
        });

        return () => {
            multiCancelOrder.unsubscribe();
        }

    }, [])

    const sendRes = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        prepareMessageeCancelAll(accountId);
    }

    const unSubscribeQuoteEvent = () => {
        const wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let unsubscribeQuoteReq = new pricingServicePb.UnsubscribeQuoteEventRequest();
            listOrder.forEach(item => {
                unsubscribeQuoteReq.addSymbolCode(item.symbolCode);
            });
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.UNSUBSCRIBE_QUOTE_REQ);
            rpcMsg.setPayloadData(unsubscribeQuoteReq.serializeBinary());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const prepareMessageeCancelAll = (accountId: string) => {
        const uid = accountId;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let cancelOrder = new tradingServicePb.CancelOrderRequest();
            cancelOrder.setHiddenConfirmFlg(false);
            listOrder.forEach(item => {
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
                cancelOrder.addOrder(order);
            });
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.CANCEL_ORDER_REQ);
            rpcMsg.setPayloadData(cancelOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }
    return <>
        <div className="popup-box">
            <div className="box">
                <div className='confirm-head'>Cancel All Confirmation</div>          
                <div className="close-icon confirm-close" onClick={() => handleCloseConfirmPopup(false)}>x</div>
            </div>
            <div className='content text-center'>
                <div className='fs-18 fw-600'>Are you sure <span className="text-danger">Cancel</span> All Order?</div>

                <div className="container d-flex mt-30">
                    <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
                        <span className="label fs-18">Total order you have selected</span>
                    </div>
                    <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
                        <span className="label fs-18">{totalOrder}</span>
                    </div>
                </div>

                <div className="d-flex justify-content-center mt-30">
                    <button className="btn btn-light" onClick={() => handleCloseConfirmPopup(false)}>DISCARD</button>
                    <button className="btn btn-primary" onClick={sendRes}>CONFIRM</button>
                </div>
            </div>

        </div>
    </>;
}
export default PopUpConfirm;