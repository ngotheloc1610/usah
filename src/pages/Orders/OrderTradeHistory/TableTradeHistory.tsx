import { SIDE, ORDER_TYPE_NAME, DEFAULT_ITEM_PER_PAGE, START_PAGE, LIST_TICKER_INFO } from "../../../constants/general.constant";
import { formatOrderTime, formatCurrency, formatNumber, calcCurrentList } from "../../../helper/utils";
import { IPropListTradeHistory, IListTradeHistory } from '../../../interfaces/order.interface'
import PaginationComponent from '../../../Common/Pagination'
import * as tspb from '../../../models/proto/trading_model_pb';
import { useEffect, useState } from "react";

function TableTradeHistory(props: IPropListTradeHistory) {
    const { getDataTradeHistory } = props
    const tradingModelPb: any = tspb;
    const [listTradeSortDate, setListTradeSortDate] = useState<IListTradeHistory[]>([])
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const totalItem = getDataTradeHistory.length;
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
        
    useEffect(() => {
        const tradeSortDate: IListTradeHistory[] = getDataTradeHistory.sort((a, b) => (b?.executedDatetime)?.localeCompare((a?.executedDatetime)));
        const currentList = calcCurrentList(currentPage, itemPerPage, tradeSortDate);
        setListTradeSortDate(currentList);
    }, [getDataTradeHistory, itemPerPage, currentPage])

    useEffect(() => {
        setCurrentPage(START_PAGE)
    }, [getDataTradeHistory])

    const getTickerCode = (symbolCode: string) => {
        return symbolsList.find(item => item.symbolCode === symbolCode)?.symbolCode;
    }

    const getTickerName = (symbolCode: string) => {
        return symbolsList.find(item => item.symbolCode === symbolCode)?.symbolName;
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
        <th className="text-end fz-14 w-120 "> Order Quantity </th>
        <th className="text-end fz-14 w-80 " >Order Price  </th>
        <th className="text-end fz-14 w-120" > Executed Quantity</th>
        <th className="text-end fz-14 w-120">Executed Price</th>
        <th className="text-end fz-14 w-120"> Matched Value</th>
        <th className="text-end fz-14 w-180"> Executed Datetime</th>
    </tr>)

    const _renderTradeHistoryTableBody = () => (
        listTradeSortDate.map((item: IListTradeHistory, index: number) => (
            <tr className="align-middle" key={index}>
                <td className="td w-160"><a href="#">{item.orderId}</a></td>
                <td className="td text-start w-120">{getTickerCode(item.tickerCode)}</td>
                <td className="td text-start w-180">{getTickerName(item.tickerCode)}</td>
                <td className="td text-center w-80">
                    <span className={`${item.side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>
                        {getSideName(item.side)}
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

    const getItemPerPage = (item: number) => {
        setItemPerPage(item);
        setCurrentPage(START_PAGE)
    }

    const getCurrentPage = (item: number) => {
        setCurrentPage(item);
    }

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
            <PaginationComponent totalItem={totalItem} itemPerPage={itemPerPage} currentPage={currentPage}
                getItemPerPage={getItemPerPage} getCurrentPage={getCurrentPage}
            />
            <p className="text-end border-top pt-3">
                <a href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
            </p>
        </div>
    )

    return (
        <>
            {_renderTradeHistoryTable()}
        </>
    )
}
export default TableTradeHistory