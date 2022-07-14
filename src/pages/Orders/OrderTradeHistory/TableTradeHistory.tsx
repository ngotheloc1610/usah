import { SIDE, ORDER_TYPE_NAME, DEFAULT_ITEM_PER_PAGE, START_PAGE, FORMAT_DATE_DOWLOAD, LIST_TICKER_ALL } from "../../../constants/general.constant";
import { formatOrderTime, formatCurrency, formatNumber, renderCurrentList, exportCSV, convertNumber } from "../../../helper/utils";
import { IPropListTradeHistory, IListTradeHistory, ITradeHistoryDownload } from '../../../interfaces/order.interface'
import PaginationComponent from '../../../Common/Pagination'
import * as tspb from '../../../models/proto/trading_model_pb';
import { useEffect, useState } from "react";
import moment from "moment";

function TableTradeHistory(props: IPropListTradeHistory) {
    const { getDataTradeHistory, isSearchData, changeStatusSearch } = props
    const tradingModelPb: any = tspb;
    const [listTradeSortDate, setListTradeSortDate] = useState<IListTradeHistory[]>([])
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const [dataDownload, setDataDownload] = useState<IListTradeHistory[]>([]);
    const totalItem = getDataTradeHistory.length;
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
        
    useEffect(() => {
        const tradeSortDate: IListTradeHistory[] = getDataTradeHistory.sort((a, b) => (b?.executedDatetime)?.localeCompare((a?.executedDatetime)));
        setDataDownload(tradeSortDate);
        const currentList = renderCurrentList(currentPage, itemPerPage, tradeSortDate);
        setListTradeSortDate(currentList);
    }, [getDataTradeHistory, itemPerPage, currentPage])

    useEffect(() => {
        if (isSearchData) {
            setCurrentPage(START_PAGE);
            if (changeStatusSearch) {
                changeStatusSearch(false)
            }
        }
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
        <th className="text-left fz-14 w-160">Order No</th>
        <th className="text-start fz-14 w-120">Ticker Code</th >
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
                <td className="td w-160">{item.externalOrderId}</td>
                <td className="td text-start w-120" title={getTickerName(item.tickerCode)}>{getTickerCode(item.tickerCode)}</td>
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
                <td className="td text-end w-120">{formatCurrency(calcMatchedValue(item).toString())}</td>
                <td className="td text-end w-180">{formatOrderTime(Number(item.executedDatetime))}</td>
            </tr>
        ))
    )

    const calcMatchedValue = (item: IListTradeHistory) => {
        if (item) {
            return convertNumber(item.executedPrice) * convertNumber(item.executedVolume);
        }
        return 0;
    }

    const getItemPerPage = (item: number) => {
        setItemPerPage(item);
        setCurrentPage(START_PAGE)
    }

    const getCurrentPage = (item: number) => {
        setCurrentPage(item);
    }

    const handleDownloadTradeHistory = () => {
        const dateTimeCurrent = moment(new Date()).format(FORMAT_DATE_DOWLOAD);
        const data: ITradeHistoryDownload[] = []
        dataDownload.forEach((item) => {
            if (item) {
                data.push({
                    orderNo: item.externalOrderId,
                    tickerCode: getTickerCode(item?.tickerCode),
                    tickerName: getTickerName(item?.tickerCode),
                    orderSide: getSideName(item.side),
                    orderType: ORDER_TYPE_NAME.limit,
                    orderQuatity: convertNumber(item.amount),
                    orderPrice: convertNumber(item.price),
                    executedQuatity: convertNumber(item.executedVolume),
                    executedPrice: convertNumber(item.executedPrice),
                    matchedValue: convertNumber(calcMatchedValue(item).toString()),
                    executedDatetime: formatOrderTime(Number(item.executedDatetime)),
                })
            }
        })
        exportCSV(data, `tradeHistory_${dateTimeCurrent}`)
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
            {listTradeSortDate.length > 0 && <p className="text-end border-top pt-3">
                <a onClick={handleDownloadTradeHistory} href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
            </p>}
        </div>
    )

    return (
        <>
            {_renderTradeHistoryTable()}
        </>
    )
}
export default TableTradeHistory