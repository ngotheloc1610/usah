import { DEFAULT_ITEM_PER_PAGE, LIST_TICKER_INFO, ORDER_TYPE_NAME, SIDE, SOCKET_CONNECTED, START_PAGE, STATE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime, formatCurrency, formatNumber, calcCurrentList } from "../../../helper/utils";
import * as tspb from '../../../models/proto/trading_model_pb';
import PaginationComponent from '../../../Common/Pagination'
import { IPropListOrderHistory, IListOrderHistory } from "../../../interfaces/order.interface";
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service";
import { useEffect, useState } from "react";
import sendMsgSymbolList from "../../../Common/sendMsgSymbolList";
import ModalMatching from "../../Modal/ModalMatching";

function OrderTable(props: IPropListOrderHistory) {
    const { listOrderHistory } = props;
    const tradingModelPb: any = tspb;
    const statusPlace = tradingModelPb.OrderState.ORDER_STATE_PLACED;
    const statusPartial = tradingModelPb.OrderState.ORDER_STATE_PARTIAL;
    const [listHistorySortDate, setListHistorySortDate] = useState<IListOrderHistory[]>([]);
    const [showModalDetail, setShowModalDetail] = useState(false)
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const totalItem = listOrderHistory.length;
    const listTicker = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[]');

    useEffect(() => {
        const historySortDate: IListOrderHistory[] = listOrderHistory.sort((a, b) => (b?.time.toString())?.localeCompare(a?.time.toString()));
        const currentList = calcCurrentList(currentPage, itemPerPage, historySortDate);
        setListHistorySortDate(currentList);
    }, [listOrderHistory, itemPerPage, currentPage])

    useEffect(() => {
        setCurrentPage(START_PAGE)
    }, [listOrderHistory])

    const getItemPerPage = (item: number) => {
        setItemPerPage(item);
        setCurrentPage(START_PAGE)
    }

    const getCurrentPage = (item: number) => {
        setCurrentPage(item);
    }

    const getTickerName = (symbolCode: string) => {
        return listTicker.find(item => item.symbolCode === symbolCode)?.symbolName;
    }

    const getSideName = (sideId: number) => {
        return SIDE.find(item => item.code === sideId)?.title;
    }

    const getStateName = (state: number) => {
        return STATE.find(item => item.code === state)?.title;
    }

    const getStatusFromModal = (isShowDetail: boolean) => {
        setShowModalDetail(isShowDetail)
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
            <th className="text-ellipsis text-end fz-14 w-120">
                <div>Order Volume</div>
                <div>Remaining Volume</div>
            </th>
            <th className="text-end fz-14 w-120"> Executed Volume </th>
            <th className="text-ellipsis text-end fz-14 w-120">
                <div>Order Price</div>
                <div>Last Price</div>
            </th>
            <th className="text-ellipsis text-end fz-14 w-200">
                <div> Order Datetime </div>
                <div> Executed Datetime </div>
            </th>
        </tr>
    )

    const _renderOrderHistoryTableBody = () => (
        listHistorySortDate?.map((item, index) => (
            <tr className="align-middle" key={index} onClick={() => setShowModalDetail(true)}>
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
                    <div>{formatNumber(calcPendingVolume(item.amount, item.filledAmount).toString())}</div>
                </td>

                <td className="text-end w-120">{formatNumber(item.filledAmount)}</td>

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

            </tr>
        ))
    )

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
                <p className="text-end border-top pt-3">
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