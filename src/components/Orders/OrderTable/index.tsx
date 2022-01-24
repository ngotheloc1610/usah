import { OBJ_AUTHEN, ORDER_TYPE_NAME, SIDE, SOCKET_CONNECTED, STATE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime, formatCurrency, formatNumber } from "../../../helper/utils";
import * as tspb from '../../../models/proto/trading_model_pb';
import Pagination from '../../../Common/Pagination'
import { IPropListOrderHistory, IListOrderHistory } from "../../../interfaces/order.interface";
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service";
import * as qspb from '../../../models/proto/query_service_pb'
import * as rspb from "../../../models/proto/rpc_pb";
import queryString from 'query-string';
import ReduxPersist from "../../../config/ReduxPersist"
import { useEffect, useState } from "react";

function OrderTable(props: IPropListOrderHistory) {
    const { listOrderHistory } = props;
    const tradingModelPb: any = tspb;
    const listOrderHistorySortDate: IListOrderHistory[] = listOrderHistory.sort((a, b) => b.time - a.time);
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMessageSymbolList();;
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

    const buildMessage = (accountId: string) => {
        const queryServicePb: any = qspb;
        let wsConnected = wsService.getWsConnected();
        if (wsConnected) {
            let currentDate = new Date();
            let symbolListRequest = new queryServicePb.SymbolListRequest();
            symbolListRequest.setAccountId(Number(accountId));

            const rpcModel: any = rspb;
            let rpcMsg = new rpcModel.RpcMessage();
            rpcMsg.setPayloadClass(rpcModel.RpcMessage.Payload.SYMBOL_LIST_REQ);
            rpcMsg.setPayloadData(symbolListRequest.serializeBinary());
            rpcMsg.setContextId(currentDate.getTime());
            wsService.sendMessage(rpcMsg.serializeBinary());
        }
    }

    const sendMessageSymbolList = () => {
        const paramStr = window.location.search;
        const objAuthen = queryString.parse(paramStr);
        let accountId = '';
        if (objAuthen) {
            if (objAuthen.access_token) {
                accountId = objAuthen.account_id ? objAuthen.account_id.toString() : '';
                ReduxPersist.storeConfig.storage.setItem(OBJ_AUTHEN, JSON.stringify(objAuthen).toString());
                buildMessage(accountId)
                return;
            }
        }
        ReduxPersist.storeConfig.storage.getItem(OBJ_AUTHEN).then((resp: string | null) => {
            if (resp) {
                const obj = JSON.parse(resp);
                accountId = obj.account_id;
                buildMessage(accountId)
                return;
            } else {
                accountId = process.env.REACT_APP_TRADING_ID ? process.env.REACT_APP_TRADING_ID : '';
                buildMessage(accountId)
                return;
            }
        });
    }

    const getTickerCode = (symbolId: string) => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolCode;
    }

    const getTickerName = (symbolId: string) => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolName;
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const getStateName = (state: number) => {
        return STATE.find(item => item.code === state)?.title;
    }

    const statusPlace = tradingModelPb.OrderState.ORDER_STATE_PLACED
    const statusPartial = tradingModelPb.OrderState.ORDER_STATE_PARTIAL

    const _renderOrderHistoryTableHeader = () =>
    (
        <tr>
            <th className="text-ellipsis-sp fz-14">Order ID</th>
            <th>
                <div className="text-ellipsis text-start fz-14">Ticker Code</div>
                <div className="text-ellipsis text-start fz-14">Ticker Name</div>
            </th >
            <th className="text-center fz-14" >Order Side</th>
            <th className="text-center fz-14" > Order Status</th>
            <th className="text-center fz-14" >Order Type</th>
            <th>
                <div className="text-ellipsis text-end fz-14">Order Volume</div>
                <div className="text-ellipsis text-end fz-14">Remaining Volume</div>
            </th>
            <th className="text-end fz-14"> Executed Volume </th>
            <th>
                <div className="text-ellipsis text-end fz-14">Order Price</div>
                <div className="text-ellipsis text-end fz-14">Last Price</div>
            </th>
            <th>
                <div className="text-ellipsis text-end fz-14"> Order Datetime </div>
                <div className="text-ellipsis text-end fz-14"> Executed Datetime </div>
            </th>
        </tr>
    )

    const _renderOrderHistoryTableBody = () => (
        listOrderHistorySortDate.map((item, index) => (
            <tr className="align-middle" key={index}>
                <td><span className="text-ellipsis fm"><a href="#">{item.orderId}</a></span></td>

                <td>
                    <div className="text-ellipsis text-start">{getTickerCode(item.symbolCode.toString())}</div>
                    <div className="text-ellipsis text-start">{getTickerName(item.symbolCode.toString())}</div>
                </td>
                <td className="text-center">
                    <span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.orderType)}</span>
                </td>

                <td className="text-center">
                    <span className={`${item.state === statusPlace || item.state === statusPartial ? 'text-info' : ''}`}>{getStateName(item.state)}</span>
                </td>

                <td className="text-center">{ORDER_TYPE_NAME.limit}</td>

                <td>
                    <div className="text-ellipsis text-end">{formatNumber(item.amount)}</div>
                    <div className="text-ellipsis text-end">{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</div>
                </td>

                <td className="text-end">{formatNumber(item.filledAmount)}</td>

                <td>
                    <div className="text-ellipsis text-end">{formatCurrency(item.price)}</div>
                    {item.lastPrice && <div className="text-ellipsis text-end">{formatCurrency(item.lastPrice)}</div>}
                    {item.lastPrice === '' && <div className="text-ellipsis text-end">&nbsp;</div>}
                </td>

                <td>
                    <div className="text-ellipsis  text-end">{formatOrderTime(item.time)}</div>
                    {item.executedDatetime && <div className="text-ellipsis  text-end">{formatOrderTime(item.time)}</div>}
                    {item.executedDatetime === '' && <div className="text-ellipsis  text-end">&nbsp;</div>}
                </td>

            </tr>
        ))
    )


    const _renderOrderHistoryTable = () => {
        return (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderOrderHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderOrderHistoryTableBody()}
                        </tbody>
                    </table>
                    <Pagination />
                </div>
                <p className="text-end border-top pt-3">
                    <a href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
                </p>
            </div>
        )
    }
    return (
        <>
            {_renderOrderHistoryTable()}
        </>
    )
}

export default OrderTable