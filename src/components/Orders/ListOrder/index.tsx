import { useEffect, useState } from "react";
import { SIDE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime } from "../../../helper/utils";
import { IListOrder, IPropListOrder } from "../../../interfaces/order.interface";
import { LIST_TICKER_INFOR_MOCK_DATA } from "../../../mocks";
import * as tspb from '../../../models/proto/trading_model_pb';
import './ListOrder.css';
import { wsService } from "../../../services/websocket-service";
import queryString from 'query-string';
import ReduxPersist from "../../../config/ReduxPersist";
import * as qspb from "../../../models/proto/query_service_pb"
import * as rspb from "../../../models/proto/rpc_pb";


const defaultProps: IPropListOrder = {
    listOrder: []
};
const ListOrder = () => {
    const [getDataOrder, setGetDataOrder] = useState<IListOrder[]>([]);

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
    const tradingModelPb: any = tspb;
    const [isShowFullData, setShowFullData] = useState(false);
    const listOrderSortDate: IListOrder[] = getDataOrder.sort((a, b) => b.time - a.time);
    const getTickerName = (sympleId: string) => {
        return LIST_TICKER_INFOR_MOCK_DATA.find(item => item.symbolId.toString() === sympleId)?.ticker;
    }
    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }
    const btnShowFullData = () => {
        setShowFullData(!isShowFullData);
    }
    const _renderTableListOrder = () => {
        return (
            <table className="dataTables_scrollBody table table-sm table-hover mb-0 dataTable no-footer" style={{ marginLeft: 0 }}>
                <thead>
                    <tr>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Order ID</span>
                        </th>
                        <th className="sorting_disabled text-center">
                            <span className="text-ellipsis">Ticker</span>
                        </th>
                        <th className="sorting_disabled text-center">
                            <span className="text-ellipsis">Side</span>
                        </th>
                        <th className="sorting_disabled text-center">
                            <span className="text-ellipsis">Type</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Price</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Volume</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Pending Volume</span>
                        </th>
                        <th className="text-end sorting_disabled">
                            <span className="text-ellipsis">Datetime</span>
                        </th>
                        <th className="text-end sorting_disabled">&nbsp;
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {getListDataOrder()}
                </tbody>
            </table>
        );
    }
    const getListDataOrder = () => (
        listOrderSortDate.map((item, index) => {
            return (
                <tr key={index} className="odd">
                    <td className="text-end w-10">{item.orderId}</td>
                    <td className="text-center w-10">{getTickerName(item.symbolCode.toString())}</td>
                    <td className="text-center w-10"><span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span></td>
                    <td className="text-center w-10">Limit</td>
                    <td className="text-end w-10">{new Intl.NumberFormat().format(Number(item.price))}</td>
                    <td className="text-end w-10">{new Intl.NumberFormat().format(Number(item.amount))}</td>
                    <td className="text-end">{new Intl.NumberFormat().format(Number(calcPendingVolume(item.amount, item.filledAmount)))}</td>
                    <td className="text-end">{formatOrderTime(item.time)}</td>
                    <td className="text-end">
                        <a className="btn-edit-order mr-10">
                            <i className="bi bi-pencil-fill"></i>
                        </a>
                        <a >
                            <i className="bi bi-x-lg"></i>
                        </a>
                    </td>
                </tr>
            )
        })
    )
    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0"><i className="bi bi-clipboard"></i> Order List</h6>
                <div><a href="#" onClick={btnShowFullData} className="btn btn-sm btn-order-list-toggle pt-0 pb-0 text-white"><i className={`bi bi-chevron-compact-${isShowFullData ? 'up' : 'down'}`}></i></a></div>
            </div>
            <div className="card-body p-0">
                <div className={`table-responsive ${!isShowFullData ? 'mh-250' : ''}`}>
                    {_renderTableListOrder()}
                </div>
            </div>
        </div>
    )
}
ListOrder.defaultProps = defaultProps;
export default ListOrder;