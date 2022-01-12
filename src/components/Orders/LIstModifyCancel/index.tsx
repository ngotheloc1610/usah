import { LIST_DATA_ORDER, LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
import Pagination from "../../../pages/Orders/OrderHistory/Pagination";
import "./ListModifyCancel.css";
import * as tspb from "../../../models/proto/trading_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";
import queryString from 'query-string';
import { wsService } from "../../../services/websocket-service";
import { useEffect, useState } from "react";
import ReduxPersist from "../../../config/ReduxPersist";
import { IListOrder, IParamOrder } from "../../../interfaces/order.interface";
import * as qspb from "../../../models/proto/query_service_pb"
import { SIDE } from "../../../constants/general.constant";
import { calcPendingVolume, formatNumber, formatOrderTime } from "../../../helper/utils";
import ConfirmOrder from "../../Modal/ConfirmOrder";

const ListModifyCancel = () => {
    const [getDataOrder, setGetDataOrder] = useState<IListOrder[]>([]);
    const tradingModelPb: any = tspb;
    const [isModify, setModify] = useState<boolean>(false);
    const defaultData: IParamOrder = {
        tickerCode: '',
        tickerName: '',
        orderType: '',
        volume: 0,
        price: 0,
        side: '',
        confirmationConfig: false,
        tickerId: ''
    }
    const [paramModify, setParamModify] = useState<IParamOrder>(defaultData);
    useEffect(() => {
        callWs();
    }, []);

    useEffect(() => {
        const listOrder = wsService.getListOrder().subscribe(response => {
            setGetDataOrder(response.orderList);
        });
        return () => listOrder.unsubscribe();
    });

    const callWs = () => {
        setTimeout(() => {
            sendListOrder();
        }, 200);
    }

    const sendListOrder = () => {
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

    const prepareMessagee = (accountId: string) => {
        const uid = accountId;
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let orderRequest = new queryServicePb.GetOrderRequest();
            orderRequest.setAccountId(uid);
            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.ORDER_LIST_REQ);
            rpcMsg.setPayloadData(orderRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }
    const getTickerName = (sympleId: string) : string => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.ticker || '';
    }
    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }
    function handleModify(item: IListOrder) {
        const param: IParamOrder = {
            tickerCode: item.symbolCode.toString(),
            tickerName: getTickerName(item.symbolCode.toString())?.toString(),
            orderType: 'limit',
            volume: Number(item.amount),
            price: Number(item.price),
            side: item.orderType.toString(),
            confirmationConfig: false,
            tickerId: item.symbolCode.toString(),
        }
        setParamModify(param);
        setModify(true);
    }
    function togglePopup(isCloseModify: boolean) {
        setModify(isCloseModify);
    }
    const getStatusOrderResponse = (value: number, content: string) => {
        // if (statusOrder === 0) {
        //     setStatusOrder(value);
        //     return <>
        //         {(value === RESPONSE_RESULT.success && content !== '') && _rendetMessageSuccess(content)}
        //         {(value === RESPONSE_RESULT.error && content !== '') && _rendetMessageError(content)}
        //     </>
        // }
        return <></>;
    }
    const getListModifyCancelData = () => (
        getDataOrder.map((item, index) => {
            return <tr key={index}>
                <td>{getTickerName(item.symbolCode.toString())}</td>
                <td className="text-center w-10"><span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span></td>
                <td>Limit</td>
                <td className="text-end">{formatNumber(item.price.toString())}</td>
                <td className="text-end">{formatNumber(item.amount.toString())}</td>
                <td className="text-end"></td>
                <td className="text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</td>
                <td className="text-center">{formatOrderTime(item.time)}</td>
                <td className="text-end">
                    <a className="btn-edit-order mr-10" onClick={() => handleModify(item)}>
                        <i className="bi bi-pencil-fill"></i>
                    </a>
                    <a>
                        <i className="bi bi-x-lg"></i>
                    </a>
                </td>
            </tr>
        })
    )
    return <div className="card-modify">
        <div className="card-body p-0 mb-3">
            <div className="table">
                <table className="table table-sm table-hover mb-0 dataTable no-footer">
                    <thead>
                        <tr>
                            <th><span>Ticker</span></th>
                            <th className="text-center"><span>Side</span></th>
                            <th className="text-center"><span>Type</span></th>
                            <th className="text-end"><span>Price</span></th>
                            <th className="text-end"><span>Volume</span></th>
                            <th className="text-end"><span>Executed Volume</span></th>
                            <th className="text-end"><span>Pending</span></th>
                            <th className="text-center"><span>Date Time</span></th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getListModifyCancelData()}
                    </tbody>
                </table>
            </div>
        </div>
        <Pagination />
        {isModify && <ConfirmOrder isModify={isModify} handleCloseConfirmPopup={togglePopup} handleOrderResponse={getStatusOrderResponse} params={paramModify} />}
    </div>
}
export default ListModifyCancel;