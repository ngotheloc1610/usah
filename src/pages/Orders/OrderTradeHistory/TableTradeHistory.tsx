import { SIDE, ORDER_TYPE_NAME, OBJ_AUTHEN, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { formatOrderTime, formatCurrency, formatNumber } from "../../../helper/utils";
import { ITradeHistory, IPropListTradeHistory } from '../../../interfaces/order.interface'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import Pagination from '../../../Common/Pagination'
import { wsService } from "../../../services/websocket-service";
import * as tspb from '../../../models/proto/trading_model_pb';
import * as qspb from '../../../models/proto/query_service_pb'
import * as rspb from "../../../models/proto/rpc_pb";
import queryString from 'query-string';
import ReduxPersist from "../../../config/ReduxPersist"
import { useEffect, useState } from "react";



function TableTradeHistory(props: IPropListTradeHistory) {
    const {getDataTradeHistory} = props
    const tradingModelPb: any = tspb;
    const listOrderHistorySortDate: ITradeHistory[] = getDataTradeHistory.sort((a: any, b: any) => b.executedDatetime - a.executedDatetime);
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

    const _renderTradeHistoryTableHeader = () =>
    (<tr>
        <th className="text-left fz-14">Order ID</th>
        <th className="text-start fz-14">Ticker Code</th >
        <th className="text-start fz-14" >Ticker Name</th>
        <th className="text-center fz-14" > Order Side </th>
        <th className="text-center fz-14" >Order Type </th>
        <th className="text-end fz-14 "> Order Volume </th>
        <th className="text-end fz-14 " >Order Price  </th>
        <th className="text-end fz-14" > Executed Volume</th>
        <th className="text-end fz-14">Executed Price</th>
        <th className="text-end fz-14"> Matched Value</th>
        <th className="text-end fz-14"> Executed Datetime</th>
    </tr>)


    const _renderTradeHistoryTableBody = () => (
        listOrderHistorySortDate.map((item: ITradeHistory, index: number) => (
            <tr className="align-middle" key={index}>
                <td><span className="text-ellipsis fm"><a href="#">{item.orderId}</a></span></td>

                <td>
                    <div className="text-ellipsis text-start">{getTickerCode(item.tickerCode.toString())}</div>
                </td>
                <td>
                    <div className="text-ellipsis text-start">{getTickerName(item.tickerCode.toString())}</div>
                </td>
                <td className="text-center">
                    <span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>
                        {getSideName(item.orderType)}
                    </span>
                </td>

                <td className="text-center">{ORDER_TYPE_NAME.limit}</td>

                <td>
                    <div className="text-ellipsis text-end">{formatNumber(item.amount)}</div>
                </td>

                <td>
                    <div className="text-ellipsis text-end">{formatCurrency(item.price)}</div>
                </td>

                <td className="text-end" >{formatNumber(item.executedVolume)}</td>

                <td>
                    <div className="text-ellipsis text-end">{formatCurrency(item.executedPrice)}</div>
                </td>

                <td>
                    <div className="text-ellipsis text-end">{formatCurrency(item.matchedValue)}</div>
                </td>
                <td>
                    <div className="text-ellipsis  text-end">{formatOrderTime(Number(item.executedDatetime))}</div>
                </td>
            </tr>
        ))
    )


    const _renderTradeHistoryTable = () => (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderTradeHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderTradeHistoryTableBody()}
                        </tbody>
                    </table>
                    <Pagination />
                </div>
                <p className="text-end border-top pt-3">
                    <a href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
                </p>
            </div>
        )
    
    return(
        <>
        {_renderTradeHistoryTable()}
        </>
    )
}
export default TableTradeHistory