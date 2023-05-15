import { DEFAULT_ITEM_PER_PAGE, FORMAT_DATE_DOWLOAD, LIST_TICKER_ALL, ORDER_TYPE, SIDE, START_PAGE, STATE, TEAM_CODE } from "../../../constants/general.constant";
import {formatOrderTime, formatCurrency, formatNumber, exportCSV, convertNumber } from "../../../helper/utils";
import * as tspb from '../../../models/proto/trading_model_pb';
import PaginationComponent from '../../../Common/Pagination'
import { IPropListOrderHistory, IDataHistoryDownload, IDataOrderHistory } from "../../../interfaces/order.interface";
import React, { useEffect, useState } from "react";
import ModalMatching from "../../Modal/ModalMatching";
import moment from "moment";
import * as stpb from '../../../models/proto/system_model_pb';
import { MESSAGE_ERROR, MESSAGE_ERROR_MIN_ORDER_VALUE_HISTORY } from "../../../constants/message.constant";
import { toast } from "react-toastify";

function OrderTable(props: IPropListOrderHistory) {
    const { listOrderHistory,
        paramHistorySearch,
        isDownLoad,
        resetFlagDownload,
        setParamHistorySearch,
        isSearch, 
        resetFlagSearch, 
        totalItem,
        isLastPage
    } = props;

    const tradingModelPb: any = tspb;
    const systemModelPb: any = stpb;
    const statusPlace = tradingModelPb.OrderState.ORDER_STATE_PLACED;

    const [showModalDetail, setShowModalDetail] = useState(false);
    const [currentPage, setCurrentPage] = useState(START_PAGE);
    const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
    const [dataCurrent, setDataCurrent] = useState<IDataOrderHistory[]>([]);
    const [dataDownload, setDataDownload] = useState<IDataOrderHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
    const teamCode = localStorage.getItem(TEAM_CODE) || '';

    useEffect(() => {
        let historySortDate: IDataOrderHistory[] = listOrderHistory?.sort((a, b) => (b.order_time?.toString())?.localeCompare(a.order_time?.toString()));
        setDataDownload(historySortDate);
        setDataCurrent(historySortDate);
        setIsLoading(false);
    }, [listOrderHistory]);

    const handleScrollToTop =  () => {
        const tableElement = document.getElementById("table-order");
        tableElement?.scrollTo({top: 0, behavior: "smooth"});
    }

    useEffect(() => {
        if(isSearch){
            setCurrentPage(START_PAGE);
            handleScrollToTop();
        } 
        // after search, reset flag = false
        if(resetFlagSearch) resetFlagSearch(false);
    }, [isSearch])

    const handleScroll = (e: any) => {
        if(paramHistorySearch.page_size === DEFAULT_ITEM_PER_PAGE) {
            if(e.target.offsetHeight + e.target.scrollTop + 1 >= e.target.scrollHeight && !isLoading && !isLastPage && e.target.scrollTop > 10) {
                setIsLoading(true);
                setParamHistorySearch({
                    ...paramHistorySearch,
                    page: paramHistorySearch.page + 1
                })
            }
        }
    }

    useEffect(() => {
        if (isDownLoad) {
            const dateTimeCurrent = moment(new Date()).format(FORMAT_DATE_DOWLOAD);
            const data: IDataHistoryDownload[] = [];
            if (dataDownload?.length > 0) {
                dataDownload.forEach(item => {
                    if (item) {
                        if(teamCode !== "null"){
                            data.push({
                                accountId: item.account_id,
                                orderNo: item?.external_order_id,
                                tickerCode: item?.symbol_code,
                                tickerName: getTickerName(item?.symbol_code),
                                orderSide: getSideName(convertNumber(item.order_side)) || '',
                                orderStatus: getStateName(convertNumber(item.order_status)) || '',
                                orderType: ORDER_TYPE.get(convertNumber(item.order_type)) || '',
                                orderVolume: item.volume,
                                remainingVolume: convertNumber(calcRemainQty(convertNumber(item.order_status), item.exec_volume, item.volume).toString()),
                                executedVolume: item.exec_volume,
                                orderPrice: formatCurrency(item.price.toString()),
                                lastPrice: item.exec_price > 0 ? formatCurrency(item.exec_price.toString()) : '-',
                                withdrawQuantity: convertNumber(item.order_status) === tradingModelPb.OrderState.ORDER_STATE_CANCELED ? formatNumber(item.withdraw_amount.toString()) : '-',
                                orderDateTime: formatOrderTime(item.order_time),
                                executedDateTime: formatOrderTime(item.exec_time),
                                comment: getMessageDisplay(convertNumber(item.msg_code), convertNumber(item.order_status), item.comment)
                            });
                        }else{
                            data.push({
                                orderNo: item?.external_order_id,
                                tickerCode: item?.symbol_code,
                                tickerName: getTickerName(item?.symbol_code),
                                orderSide: getSideName(convertNumber(item.order_side)) || '',
                                orderStatus: getStateName(convertNumber(item.order_status)) || '',
                                orderType: ORDER_TYPE.get(convertNumber(item.order_type)) || '',
                                orderVolume: item.volume,
                                remainingVolume: convertNumber(calcRemainQty(convertNumber(item.order_status), item.exec_volume, item.volume).toString()),
                                executedVolume: item.exec_volume,
                                orderPrice: formatCurrency(item.price.toString()),
                                lastPrice: item.exec_price > 0 ? formatCurrency(item.exec_price.toString()) : '-',
                                withdrawQuantity: convertNumber(item.order_status) === tradingModelPb.OrderState.ORDER_STATE_CANCELED ? formatNumber(item.withdraw_amount.toString()) : '-',
                                orderDateTime: formatOrderTime(item.order_time),
                                executedDateTime: formatOrderTime(item.exec_time),
                                comment: getMessageDisplay(convertNumber(item.msg_code), convertNumber(item.order_status), item.comment)
                            });
                        }
                        
                    }
                });
                exportCSV(data, `orderHistory_${dateTimeCurrent}`);
            } else {
                toast.warn('Do not have record to download');
            }

            // after download, reset flag = false
            if (resetFlagDownload) {
                resetFlagDownload(false);
            }
        }
    }, [isDownLoad])

    const getItemPerPage = (item: number) => {
        setItemPerPage(item);
        setCurrentPage(START_PAGE);
        setParamHistorySearch({
            ...paramHistorySearch,
            page: START_PAGE,
            page_size: item
        })
        handleScrollToTop();
    }

    const getCurrentPage = (item: number) => {
        setCurrentPage(item);
        setParamHistorySearch({
            ...paramHistorySearch,
            page: item,
        })
        handleScrollToTop();
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

    const checkDisplayLastUpdatedTime = (item: IDataOrderHistory) => {
        const isCheckItemFilledAmount = convertNumber(item.exec_volume) > 0;
        const isOrderReceived = convertNumber(item.order_status) === tradingModelPb.OrderState.ORDER_STATE_PLACED;
        if ((getStateName(convertNumber(item.order_status)) === STATE[0].name && !isCheckItemFilledAmount) || (isOrderReceived && !isCheckItemFilledAmount)) {
            return false;
        }
        return true;
    }

    const getMessageDisplay = (msgCode: number, state: number, comment: string) => {
        if (state !== tradingModelPb.OrderState.ORDER_STATE_REJECTED) {
            return '-';
        }
        if (msgCode === systemModelPb.MsgCode.MT_RET_NOT_ENOUGH_MIN_ORDER_VALUE) {
            return MESSAGE_ERROR_MIN_ORDER_VALUE_HISTORY;
        }
        if (msgCode === systemModelPb.MsgCode.MT_RET_ERROR_FROM_BO) {
            return comment
        }
        return MESSAGE_ERROR.get(msgCode) || '-';
    }

    const calcRemainQty = (state: number, execQty: number, originQty: number) => {
        
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
            {teamCode !== "null" && <th className="text-ellipsis-sp fz-14 w-120">Account Id</th>}
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
                {teamCode !== "null" && <td className="w-120"><span className="text-ellipsis fm">{item.account_id}</span></td>}
                <td className="w-180"><span className="text-ellipsis fm">{item.external_order_id}</span></td>
                <td className="text-ellipsis text-start w-110">
                    <div title={getTickerName(item?.symbol_code)}>{item?.symbol_code}</div>
                </td>
                <td className="text-center w-120">
                    <span className={`${convertNumber(item.order_side) === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>{getSideName(convertNumber(item.order_side))}</span>
                </td>

                <td className="text-start w-120">
                    <span className={`${convertNumber(item.order_status) === statusPlace && 'text-info'}`}>{getStateName(convertNumber(item.order_status))}</span>
                </td>

                <td className="text-center w-120">{ORDER_TYPE.get(convertNumber(item.order_type))}</td>

                <td className="text-ellipsis text-end w-140">
                    <div>{formatNumber(item.volume.toString())}</div>
                    <div>{formatNumber(calcRemainQty(convertNumber(item.order_status), item.exec_volume, item.volume).toString())}</div>
                </td>

                <td className="text-end w-120">{formatNumber(item.exec_volume?.toString())}</td>

                <td className="text-ellipsis text-end w-120">
                    <div className="">{formatCurrency(item.price.toString())}</div>
                    <div>{(item?.exec_price > 0 && item?.exec_volume) ? formatCurrency(item?.exec_price.toString()) : '-'}</div>
                </td>
                <td className="text-end">{convertNumber(item.order_status) === tradingModelPb.OrderState.ORDER_STATE_CANCELED ? formatNumber(item.withdraw_amount.toString()) : '-'}</td>
                <td className="td w-200 text-center">
                    <div>{formatOrderTime(item.order_time)}</div>
                    {checkDisplayLastUpdatedTime(item) && <div >{formatOrderTime(convertNumber(item.exec_time))}</div>}
                    {!checkDisplayLastUpdatedTime(item) && <div >-</div>}
                </td>

                <td className="text-start fz-14 w-200">{getMessageDisplay(convertNumber(item.msg_code), convertNumber(item.order_status), item.comment)}</td>

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
                        <tbody id="table-order" onScroll={handleScroll}>
                            {_renderOrderHistoryTableBody()}
                            {isLoading && (
                                <tr className="text-center">
                                    <td className="spinner-border spinner-border-sm" role="status">
                                        <span className="sr-only"></span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationComponent totalItem={totalItem} itemPerPage={itemPerPage} currentPage={currentPage}
                    getItemPerPage={getItemPerPage} getCurrentPage={getCurrentPage} isShowAllRecord={true}
                />
                {/* {dataCurrent.length > 0 && <p className="text-end border-top pt-3">
                    <a className="btn btn-success text-white ps-4 pe-4" onClick={handleDownload}><i className="bi bi-cloud-download"></i> Download</a>
                </p>} */}
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

export default React.memo(OrderTable)