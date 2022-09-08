import { DEFAULT_ITEM_PER_PAGE, FORMAT_DATE_DOWLOAD, LIST_TICKER_ALL, ORDER_TYPE, ORDER_TYPE_NAME, SIDE, START_PAGE, STATE } from "../../../constants/general.constant";
import { calcPendingVolume, formatOrderTime, formatCurrency, formatNumber, renderCurrentList, exportCSV, convertNumber } from "../../../helper/utils";
import * as tspb from '../../../models/proto/trading_model_pb';
import PaginationComponent from '../../../Common/Pagination'
import { IPropListOrderHistory, IOrderHistory, IDataHistoryDownload } from "../../../interfaces/order.interface";
import { useEffect, useState } from "react";
import ModalMatching from "../../Modal/ModalMatching";
import moment from "moment";
import * as stpb from '../../../models/proto/system_model_pb';
import { MESSAGE_ERROR, MESSAGE_ERROR_MIN_ORDER_VALUE_HISTORY } from "../../../constants/message.constant";

function OrderTable(props: IPropListOrderHistory) {
    const { listOrderHistory, paramHistorySearch } = props;
    const tradingModelPb: any = tspb;
    const statusPlace = tradingModelPb.OrderState.ORDER_STATE_PLACED;
    const [showModalDetail, setShowModalDetail] = useState(false)
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const [totalItem, setTotalItem] = useState<number>(0);
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
    const [dataCurrent, setDataCurrent] = useState<IOrderHistory[]>([]);
    const [dataDownload, setDataDownload] = useState<IOrderHistory[]>([]);
    const systemModelPb: any = stpb;
    
    useEffect(() => {
        let historySortDate: IOrderHistory[] = listOrderHistory.sort((a, b) => (b?.time.toString())?.localeCompare(a?.time.toString()));
        if (paramHistorySearch.symbolCode) {
            historySortDate = historySortDate.filter(item => item.symbolCode === paramHistorySearch.symbolCode);
        }
        if (paramHistorySearch.orderState > 0) {
            // TODO: ORDER_STATE_PARTIAL and ORDER_STATE_MATCHED show name as 'Partially done'.
            if (paramHistorySearch.orderState === tradingModelPb.OrderState.ORDER_STATE_PARTIAL) {
                historySortDate = historySortDate.filter(item => item.state === paramHistorySearch.orderState ||
                    item.state === tradingModelPb.OrderState.ORDER_STATE_MATCHED)
            } else {
                historySortDate = historySortDate.filter(item => item.state === paramHistorySearch.orderState);
            }
        }
        if (paramHistorySearch.orderSide > 0) {
            historySortDate = historySortDate.filter(item => item.side === paramHistorySearch.orderSide);
        }

        if (paramHistorySearch.orderType !== tradingModelPb.OrderType.OP_NONE) {
            historySortDate = historySortDate.filter(item => item.orderType === paramHistorySearch.orderType);
        }

        setDataDownload(historySortDate);
        setTotalItem(historySortDate.length);
        const currentList = renderCurrentList(currentPage, itemPerPage, historySortDate);
        setDataCurrent(currentList);
    }, [listOrderHistory, itemPerPage, currentPage]);

    useEffect(() => {
        setCurrentPage(START_PAGE);
    }, [paramHistorySearch])

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
        return STATE.find(item => item.code === state)?.name;
    }

    const getStatusFromModal = (isShowDetail: boolean) => {
        setShowModalDetail(isShowDetail);
    }

    const checkDisplayLastUpdatedTime = (item: IOrderHistory) => {
        const isCheckItemFilledAmount = convertNumber(item.filledAmount) > 0;
        const isOrderReceived = item.state === tradingModelPb.OrderState.ORDER_STATE_PLACED;
        if ((getStateName(item?.state) === STATE[0].name && !isCheckItemFilledAmount) || (isOrderReceived && !isCheckItemFilledAmount)) {
            return false;
        }
        return true;
    }
    const checkDisplayLastPrice = (state, volume) => {
        const orderStatePlaced = tradingModelPb.OrderState.ORDER_STATE_PLACED;
        const orderStateCancel = tradingModelPb.OrderState.ORDER_STATE_CANCELED;
        if ((state === orderStatePlaced || state === orderStateCancel) && convertNumber(volume) === 0) {
            return false;
        }
        return true;
    }

    const getMessageDisplay = (msgCode: number, state: number) => {
        if (state !== tradingModelPb.OrderState.ORDER_STATE_REJECTED) {
            return '-';
        }
        if (msgCode === systemModelPb.MsgCode.MT_RET_NOT_ENOUGH_MIN_ORDER_VALUE) {
            return MESSAGE_ERROR_MIN_ORDER_VALUE_HISTORY;
        }
        return MESSAGE_ERROR.get(msgCode) || '-';
    }

    const calcRemainQty = (state: number, execQty: string, originQty: string) => {
        switch (state) {
            case tradingModelPb.OrderState.ORDER_STATE_CANCELED:
            case tradingModelPb.OrderState.ORDER_STATE_REJECTED:
            case tradingModelPb.OrderState.ORDER_STATE_FILLED:
            case tradingModelPb.OrderState.ORDER_STATE_PARTIAL:
                return 0;
            default:
                return convertNumber(originQty) - convertNumber(execQty);
        }
    }
    
    const _renderOrderHistoryTableHeader = () =>
    (
        <tr>
            <th className="text-ellipsis-sp fz-14 w-180">Order No</th>
            <th className="text-ellipsis text-start fz-14 w-110">Ticker Code</th >
            <th className="text-center fz-14 w-120" >Order Side</th>
            <th className="text-start fz-14 w-120" > Order Status</th>
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
            <th className="text-end text-nowrap fz-14 w-120" >Withdraw Quantity</th>
            <th className="text-ellipsis text-end fz-14 w-200">
                <div className="mg-right-24"> Order Datetime </div>
                <div className="mg-right-24"> Last Updated time </div>
            </th>
            <th className="text-ellipsis fz-14 w-200">Comment</th>
        </tr>
    )

    const _renderOrderHistoryTableBody = () => (
        dataCurrent?.map((item, index) => (
            <tr className="align-middle" key={index}>
                <td className="w-180"><span className="text-ellipsis fm">{item.externalOrderId}</span></td>
                <td className="text-ellipsis text-start w-110">
                    <div title={getTickerName(item?.symbolCode)}>{item?.symbolCode}</div>
                </td>
                <td className="text-center w-120">
                    <span className={`${item.side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(item.side)}</span>
                </td>

                <td className="text-start w-120">
                    <span className={`${item.state === statusPlace && 'text-info'}`}>{getStateName(item.state)}</span>
                </td>

                <td className="text-center w-120">{ORDER_TYPE.get(item.orderType)}</td>

                <td className="text-ellipsis text-end w-140">
                    <div>{formatNumber(item.amount)}</div>
                    <div>{formatNumber(calcRemainQty(item.state, item.filledAmount, item.amount).toString())}</div>
                </td>

                <td className="text-end w-120">{formatNumber(item.filledAmount)}</td>

                <td className="text-ellipsis text-end w-120">
                    <div className="">{item.orderType === tradingModelPb.OrderType.OP_LIMIT ? formatCurrency(item.price) : '-'}</div>
                    {checkDisplayLastPrice(item.state, item.filledAmount) && <div>{convertNumber(item?.lastPrice) > 0 ? formatCurrency(item?.lastPrice) : '-'}</div>}
                    {!checkDisplayLastPrice(item.state, item.filledAmount) && <div>-</div>}
                </td>
                <td className="text-end">{item.state === tradingModelPb.OrderState.ORDER_STATE_CANCELED ? formatNumber(item.withdrawAmount) : '-'}</td>
                <td className="td w-200 text-center">
                    <div>{formatOrderTime(item.time)}</div>
                    {checkDisplayLastUpdatedTime(item) && <div >{formatOrderTime(convertNumber(item.executedDatetime))}</div>}
                    {!checkDisplayLastUpdatedTime(item) && <div >-</div>}
                </td>

                <td className="text-start fz-14 w-200">{getMessageDisplay(item.msgCode, item.state)}</td>

            </tr>
        ))
    )

    const handleDownload = () => {
        const dateTimeCurrent = moment(new Date()).format(FORMAT_DATE_DOWLOAD);
        const data: IDataHistoryDownload[] = [];
        dataDownload.forEach(item => {
            if (item) {
                data.push({
                    orderNo: item?.externalOrderId,
                    tickerCode: item?.symbolCode,
                    tickerName: getTickerName(item?.symbolCode),
                    orderSide: getSideName(item.side) || '',
                    orderStatus: getStateName(item.state) || '',
                    orderType: ORDER_TYPE.get(item.orderType) || '',
                    orderVolume: convertNumber(item.amount),
                    remainingVolume: convertNumber(calcRemainQty(item.state, item.filledAmount, item.amount).toString()),
                    executedVolume: convertNumber(item.filledAmount),
                    orderPrice: item.orderType === tradingModelPb.OrderType.OP_LIMIT ? item.price : '-',
                    lastPrice: convertNumber(item.lastPrice) > 0 ? item.lastPrice : '-',
                    withdrawQuantity: item.state === tradingModelPb.OrderState.ORDER_STATE_CANCELED ? formatNumber(item.withdrawAmount) : '-',
                    orderDateTime: formatOrderTime(item.time),
                    executedDateTime: formatOrderTime(item.time),
                    comment: getMessageDisplay(item.msgCode, item.state)
                });
            }
        });
        exportCSV(data, `orderHistory_${dateTimeCurrent}`);
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
                {dataCurrent.length > 0 && <p className="text-end border-top pt-3">
                    <a className="btn btn-success text-white ps-4 pe-4" onClick={handleDownload}><i className="bi bi-cloud-download"></i> Download</a>
                </p>}
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