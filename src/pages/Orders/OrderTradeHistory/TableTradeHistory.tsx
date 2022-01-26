import { SIDE, ORDER_TYPE_NAME, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { formatOrderTime, formatCurrency, formatNumber } from "../../../helper/utils";
import { ITradeHistory, IPropListTradeHistory } from '../../../interfaces/order.interface'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import Pagination from '../../../Common/Pagination'
import { wsService } from "../../../services/websocket-service";
import * as tspb from '../../../models/proto/trading_model_pb';
import { useEffect, useState } from "react";
import SendMsgSymbolList from "../../../Common/SendMsgSymbolList";

function TableTradeHistory(props: IPropListTradeHistory) {
    const {getDataTradeHistory} = props
    const tradingModelPb: any = tspb;
    const listOrderHistorySortDate: ITradeHistory[] = getDataTradeHistory.sort((a, b) => Number(b.executedDatetime) - Number(a.executedDatetime));
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                SendMsgSymbolList();;
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])

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