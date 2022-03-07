import queryString from 'query-string';
import { ACCOUNT_ID, MODIFY_CANCEL_STATUS, MSG_CODE, MSG_TEXT, OBJ_AUTHEN, RESPONSE_RESULT } from '../../../constants/general.constant';
import { IAuthen } from '../../../interfaces';
import { wsService } from '../../../services/websocket-service';
import ReduxPersist from '../../../config/ReduxPersist';
import * as smpb from '../../../models/proto/system_model_pb';
import * as tmpb from '../../../models/proto/trading_model_pb';
import * as tspb from '../../../models/proto/trading_service_pb';
import * as sspb from '../../../models/proto/system_service_pb'
import { IListOrder } from '../../../interfaces/order.interface';
import * as rpc from '../../../models/proto/rpc_pb';
import { useEffect } from 'react';

interface IPropsConfirm {
    handleCloseConfirmPopup: (value: boolean) => void;
    totalOrder: number;
    listOrder: IListOrder[];
    handleOrderResponse: (value: number, content: string) => void;
    handleStatusCancelAll?: (value: boolean) => void;
}

const PopUpConfirm = (props: IPropsConfirm) => {
    const { handleCloseConfirmPopup, totalOrder, listOrder, handleOrderResponse, handleStatusCancelAll } = props;

    const tradingServicePb: any = tspb;
    const tradingModelPb: any = tmpb;
    
    const rProtoBuff: any = rpc;

    const sendRes = () => {
        let accountId = localStorage.getItem(ACCOUNT_ID) || '';
        prepareMessageeCancelAll(accountId);
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
                cancelOrder.addOrder(order);
            });
            let rpcMsg = new rProtoBuff.RpcMessage();
            rpcMsg.setPayloadClass(rProtoBuff.RpcMessage.Payload.CANCEL_ORDER_REQ);
            rpcMsg.setPayloadData(cancelOrder.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
            const systemModelPb: any = smpb;
            const multiCancelOrder = wsService.getCancelSubject().subscribe(resp => {
                let tmp = 0;
                if (resp[MSG_CODE] === systemModelPb.MsgCode.MT_RET_OK) {
                    if (handleStatusCancelAll) {
                        // Get status modify or cancel order response
                        handleStatusCancelAll(MODIFY_CANCEL_STATUS.success)
                    }
                    tmp = RESPONSE_RESULT.success;
                } else {
                    if (handleStatusCancelAll) {
                        // Get status modify or cancel order response
                        handleStatusCancelAll(MODIFY_CANCEL_STATUS.error)
                    }
                    tmp = RESPONSE_RESULT.error;
                }
                handleOrderResponse(tmp, resp[MSG_TEXT]);
                handleCloseConfirmPopup(false);
            });
        }
    }
    return <>
        <div className="popup-box">
            <div className="box d-flex">
                Cancel All Confirmation
                <span className="close-icon" onClick={() => handleCloseConfirmPopup(false)}>x</span>
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