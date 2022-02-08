import { SIDE, ORDER_TYPE_NAME, SOCKET_CONNECTED } from "../../../constants/general.constant";
import { formatOrderTime, formatCurrency, formatNumber } from "../../../helper/utils";
import { ITradeHistory, IPropListTradeHistory } from '../../../interfaces/order.interface'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import Pagination from '../../../Common/Pagination'
import { wsService } from "../../../services/websocket-service";
import * as tspb from '../../../models/proto/trading_model_pb';
import { useEffect, useState } from "react";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";

function TableTradeHistory(props: IPropListTradeHistory) {
    const {getDataTradeHistory} = props
    const tradingModelPb: any = tspb;
    const listOrderHistorySortDate: ITradeHistory[] = getDataTradeHistory.sort((a, b) => Number(b.executedDatetime) - Number(a.executedDatetime));
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();;
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
        <th className="text-left fz-14 w-160">Order ID</th>
        <th className="text-start fz-14 w-120">Ticker Code</th >
        <th className="text-start fz-14 w-180" >Ticker Name</th>
        <th className="text-center fz-14 w-80" > Order Side </th>
        <th className="text-center fz-14 w-80" >Order Type </th>
        <th className="text-end fz-14 w-120 "> Order Volume </th>
        <th className="text-end fz-14 w-80 " >Order Price  </th>
        <th className="text-end fz-14 w-120" > Executed Volume</th>
        <th className="text-end fz-14 w-120">Executed Price</th>
        <th className="text-end fz-14 w-120"> Matched Value</th>
        <th className="text-end fz-14 w-180"> Executed Datetime</th>
    </tr>)

    const _renderTradeHistoryTableBody = () => (
        listOrderHistorySortDate.map((item: ITradeHistory, index: number) => (
            <tr className="align-middle" key={index}>
                <td className="td w-160"><a href="#">{item.orderId}</a></td>
                <td className="td text-start w-120">{getTickerCode(item.tickerCode.toString())}</td>
                <td className="td text-start w-180">{getTickerName(item.tickerCode.toString())}</td>
                <td className="td text-center w-80">
                    <span className={`${item.orderType === tradingModelPb.OrderType.OP_BUY ? 'text-danger' : 'text-success'}`}>
                        {getSideName(item.orderType)}
                    </span>
                </td>
                <td className="text-center w-80">{ORDER_TYPE_NAME.limit}</td>
                <td className="td text-end w-120">{formatNumber(item.amount)}</td>
                <td className="td text-end w-80">{formatCurrency(item.price)}</td>
                <td className="td text-end w-120" >{formatNumber(item.executedVolume)}</td>
                <td className="td text-end w-120">{formatCurrency(item.executedPrice)}</td>
                <td className="td text-end w-120">{formatCurrency(item.matchedValue)}</td>
                <td className="td text-end w-180">{formatOrderTime(Number(item.executedDatetime))}</td>
            </tr>
        ))
    )

    const _renderTradeHistoryTable = () => (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0 tableBodyScroll" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderTradeHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderTradeHistoryTableBody()}
                        </tbody>
                    </table>
                </div>
                    <Pagination />
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