import { DEFAULT_ITEM_PER_PAGE, LIST_TICKER_INFO, ORDER_TYPE_NAME, SIDE, START_PAGE, STATE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime, formatCurrency, formatNumber, renderCurrentList, exportCSV } from "../../../helper/utils";
import * as tspb from '../../../models/proto/trading_model_pb';
import PaginationComponent from '../../../Common/Pagination'
import { IPropListOrderHistory, IOrderHistory, IDataHistory } from "../../../interfaces/order.interface";
import { useEffect, useState } from "react";
import ModalMatching from "../../Modal/ModalMatching";

function OrderTable(props: IPropListOrderHistory) {
    const { listOrderHistory, paramHistorySearch } = props;
    const tradingModelPb: any = tspb;
    const statusPlace = tradingModelPb.OrderState.ORDER_STATE_PLACED;
    const statusPartial = tradingModelPb.OrderState.ORDER_STATE_PARTIAL;
    const [showModalDetail, setShowModalDetail] = useState(false)
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const [totalItem, setTotalItem] = useState<number>(0);
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');
    const [dataCurrent, setDataCurrent] = useState<IOrderHistory[]>([]);

    useEffect(() => {
        let historySortDate: IOrderHistory[] = listOrderHistory.sort((a, b) => (b?.time.toString())?.localeCompare(a?.time.toString()));
        if (paramHistorySearch.symbolCode) {
            historySortDate = historySortDate.filter(item => item.symbolCode === paramHistorySearch.symbolCode);
        }
        if (paramHistorySearch.orderState > 0) {
            historySortDate = historySortDate.filter(item => item.state === paramHistorySearch.orderState);
        }
        if (paramHistorySearch.orderSide > 0) {
            historySortDate = historySortDate.filter(item => item.side === paramHistorySearch.orderSide);
        }
        if (paramHistorySearch.fromDate > 0) {
            historySortDate = historySortDate.filter(item =>
                item.time > Number(paramHistorySearch.fromDate) ||
                item.time === Number(paramHistorySearch.fromDate));
        }
        if (paramHistorySearch.toDate > 0) {
            historySortDate = historySortDate.filter(item =>
                item.time < Number(paramHistorySearch.toDate) ||
                item.time === Number(paramHistorySearch.toDate));
        }
        setTotalItem(historySortDate.length);
        const currentList = renderCurrentList(currentPage, itemPerPage, historySortDate);
        setDataCurrent(currentList);
    }, [listOrderHistory, itemPerPage, currentPage, paramHistorySearch]);

    useEffect(() => {
        setCurrentPage(START_PAGE);
    }, [listOrderHistory, paramHistorySearch])

    const getItemPerPage = (item: number) => {
        setItemPerPage(item);
        setCurrentPage(START_PAGE);
    }

    const getCurrentPage = (item: number) => {
        setCurrentPage(item);
    }

    const getTickerName = (symbolCode: string) => {
        return symbolsList.find(item => item.symbolCode === symbolCode)?.symbolName;
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const getStateName = (state: number) => {
        return STATE.find(item => item.code === state)?.title;
    }

    const getStatusFromModal = (isShowDetail: boolean) => {
        setShowModalDetail(isShowDetail);
    }

    const _renderOrderHistoryTableHeader = () =>
    (
        <tr>
            <th className="text-ellipsis-sp fz-14 w-180">Order ID</th>
            <th className="text-ellipsis text-start fz-14 w-220">
                <div>Ticker Code</div>
                <div>Ticker Name</div>
            </th >
            <th className="text-center fz-14 w-120" >Order Side</th>
            <th className="text-center fz-14 w-120" > Order Status</th>
            <th className="text-center fz-14 w-120" >Order Type</th>
            <th className="text-ellipsis text-end fz-14 w-140">
                <div>Order Quantity</div>
                <div>Remaining Quantity</div>
            </th>
            <th className="text-end fz-14 w-120"> Executed Quantity </th>
            <th className="text-ellipsis text-end fz-14 w-120">
                <div>Order Price</div>
                <div>Executed Price</div>
            </th>
            <th className="text-ellipsis text-end fz-14 w-200">
                <div> Order Datetime </div>
                <div> Executed Datetime </div>
            </th>
            <th className="text-center fz-14 w-120">Comment</th>
        </tr>
    )
    
    const _renderOrderHistoryTableBody = () => (
        dataCurrent?.map((item, index) => (
            <tr className="align-middle" key={index}>
                <td className="w-180"><span className="text-ellipsis fm"><a href="#">{item.orderId}</a></span></td>
                <td className="text-ellipsis text-start w-220">
                    <div>{item?.symbolCode}</div>
                    <div>{getTickerName(item?.symbolCode)}</div>
                </td>
                <td className="text-center w-120">
                    <span className={`${item.side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.side)}</span>
                </td>

                <td className="text-center w-120">
                    <span className={`${item.state === statusPlace || item.state === statusPartial ? 'text-info' : ''}`}>{getStateName(item.state)}</span>
                </td>

                <td className="text-center w-120">{ORDER_TYPE_NAME.limit}</td>

                <td className="text-ellipsis text-end w-120">
                    <div>{formatNumber(item.amount)}</div>
                    <div>{formatNumber(calcPendingVolume(item.amount, item.state === tradingModelPb.OrderState.ORDER_STATE_CANCELED ? item.amount : item.filledAmount).toString())}</div>
                </td>

                <td className="text-end w-120">{item.state === tradingModelPb.OrderState.ORDER_STATE_CANCELED ? formatNumber(item.amount) : formatNumber(item.filledAmount)}</td>

                <td className="text-ellipsis text-end w-120">
                    <div className="">{formatCurrency(item.price)}</div>
                    {item.lastPrice && <div>{formatCurrency(item.lastPrice)}</div>}
                    {item.lastPrice === '' && <div>&nbsp;</div>}
                </td>

                <td className="td w-200 text-end">
                    <div>{formatOrderTime(item.time)}</div>
                    {item.executedDatetime && <div >{formatOrderTime(item.time)}</div>}
                    {item.executedDatetime === '' && <div >&nbsp;</div>}
                </td>

                <td className="text-ellipsis fz-14 w-120">{item.comment}</td>

            </tr>
        ))
    )

    const handleDownload = () => {
        const data: IDataHistory[] = [];
        dataCurrent.forEach(item => {
            if (item) {
                data.push({
                    orderId: Number(item?.orderId),
                    tickerCode: item?.symbolCode,
                    tickerName: getTickerName(item?.symbolCode),
                    orderSide: getSideName(item.side) || '',
                    orderStatus: getStateName(item.state) || '',
                    orderType: ORDER_TYPE_NAME.limit,
                    orderVolume: formatNumber(item.amount) || '',
                    remainingVolume: formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString()) || '',
                    executedVolume: formatNumber(item.filledAmount),
                    orderPrice: formatCurrency(item.price),
                    lastPrice: formatCurrency(item.lastPrice),
                    orderDateTime: formatOrderTime(item.time),
                    executedDateTime: formatOrderTime(item.time)
                });
            }
        });
        exportCSV(data, 'orderHistory');
    }

    const _renderOrderHistoryTable = () => {
        return (
            <div className="card-body">
                <div className="table-responsive mb-3">
                    <table id="table" className="table table-sm table-hover mb-0 tableBodyScroll" cellSpacing="0" cellPadding="0">
                        <thead>
                            {_renderOrderHistoryTableHeader()}
                        </thead>
                        <tbody>
                            {_renderOrderHistoryTableBody()}
                        </tbody>
                    </table>
                </div>
                <PaginationComponent totalItem={totalItem} itemPerPage={itemPerPage} currentPage={currentPage}
                    getItemPerPage={getItemPerPage} getCurrentPage={getCurrentPage}
                />
                <p className="text-end border-top pt-3" onClick={handleDownload}>
                    <a href="#" className="btn btn-success text-white ps-4 pe-4"><i className="bi bi-cloud-download"></i> Download</a>
                </p>
                {showModalDetail && <ModalMatching getStatusFromModal={getStatusFromModal} />}
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