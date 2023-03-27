import { SIDE, ORDER_TYPE_NAME, DEFAULT_ITEM_PER_PAGE, START_PAGE, FORMAT_DATE_DOWLOAD, LIST_TICKER_ALL, ORDER_TYPE, TEAM_CODE } from "../../../constants/general.constant";
import { formatOrderTime, formatCurrency, formatNumber, renderCurrentList, exportCSV, convertNumber, defindConfigPost } from "../../../helper/utils";
import { IPropListTradeHistory, IListTradeHistoryAPI, ITradeHistoryDownload } from '../../../interfaces/order.interface'
import PaginationComponent from '../../../Common/Pagination'
import * as tspb from '../../../models/proto/trading_model_pb';
import { useEffect, useState, useRef } from "react";
import moment from "moment";
import {toast} from 'react-toastify'
import axios from "axios";
import { API_TRADE_HISTORY } from "../../../constants/api.constant";
import { success, unAuthorised } from "../../../constants";

function TableTradeHistory(props: IPropListTradeHistory) {
    const { isDownload, resetStatusDownload, paramSearch, handleChangeItemPerPage, handleChangePage, handleChangeNextPage, handleUnAuthorisedAcc } = props
    const tradingModelPb: any = tspb;
    const [listTradeSortDate, setListTradeSortDate] = useState<IListTradeHistoryAPI[]>([])
    const [totalItem, setTotalItem] = useState(10)
    const symbolsList = JSON.parse(localStorage.getItem(LIST_TICKER_ALL) || '[]');
    const [loading, setLoading] = useState(false)
    const [isLastPage, setIsLastPage] = useState(false)

    const api_url = window.globalThis.apiUrl;
    const urlTradeHistory = `${api_url}${API_TRADE_HISTORY}`;

    const teamCode = localStorage.getItem(TEAM_CODE) || ''

    useEffect(() => {
        if (window.globalThis.flagRmsApi === 'true') {
                    axios.post(urlTradeHistory, paramSearch, defindConfigPost()).then((resp) => {
                        if (resp?.status === success) {
                            const resultData = resp?.data?.results;
                            const totalRecord = resp?.data?.count;
                            const lastPage = resp?.data?.total_page
                            handleUnAuthorisedAcc(false)
                            setLoading(false)

                            if(paramSearch.page === START_PAGE || paramSearch.page_size !== DEFAULT_ITEM_PER_PAGE) {
                                const listTradeSort = resultData.sort((a, b) => (b?.executedDatetime)?.localeCompare((a?.executedDatetime)))
                                setListTradeSortDate(listTradeSort)
                            } else {
                                const tmpData = [
                                    ...listTradeSortDate,
                                    ...resultData
                                ]
                                const listTradeSort = tmpData.sort((a, b) => (b?.executedDatetime)?.localeCompare((a?.executedDatetime)))
                                setListTradeSortDate(listTradeSort)
                            }

                            //check lastPage
                            if(paramSearch.page === lastPage) {
                                setIsLastPage(true)
                            }else {
                                setIsLastPage(false)
                            }

                            // totalItem
                            if(paramSearch.page_size < DEFAULT_ITEM_PER_PAGE) {
                                setTotalItem(totalRecord)
                            } else {
                                setTotalItem(10)
                            }
                        }
                    },
                        (error: any) => {
                            const msgCode = error.response.status
                            if(msgCode === unAuthorised) {
                                handleUnAuthorisedAcc(true)
                                setListTradeSortDate([])
                            }
                    });
                }
    }, [paramSearch])

    useEffect(() => {
        if(paramSearch.page === 1 || paramSearch.page_size !== DEFAULT_ITEM_PER_PAGE) {
            const tableElement = document.getElementById('table-trade')
            tableElement?.scrollTo({ top: 0, behavior: "smooth" })
        }
    }, [paramSearch])

    useEffect(() => {
        if(isDownload) {
            const dateTimeCurrent = moment(new Date()).format(FORMAT_DATE_DOWLOAD);
            const data: ITradeHistoryDownload[] = []
            if(listTradeSortDate.length > 0) {
                listTradeSortDate.forEach((item) => {
                    if (item) {
                        data.push({
                            orderNo: item.external_order_id,
                            tickerCode: getTickerCode(item?.symbol_code),
                            tickerName: getTickerName(item?.symbol_code),
                            orderSide: getSideName(item.order_side),
                            orderType: ORDER_TYPE.get(item.order_type) || '-',
                            orderQuantity: convertNumber(item.volume),
                            orderPrice: formatCurrency(item.price),
                            executedQuantity: convertNumber(item.exec_volume),
                            executedPrice: convertNumber(item.exec_price),
                            matchedValue: convertNumber(calcMatchedValue(item).toString()),
                            executedDatetime: formatOrderTime(Number(item.exec_time)),
                        })
                    }
                })
                exportCSV(data, `tradeHistory_${dateTimeCurrent}`)
            }else {
                toast.warn('Do not have record to download')
            }

            if(resetStatusDownload) {
                resetStatusDownload(false)
            }
        }
    }, [isDownload])

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
        {teamCode && teamCode !== 'null' && (
            <th className="text-left fz-14 w-120">Account Id</th>
        )}
        <th className="text-left fz-14 w-100p">Order No</th>
        <th className="text-center fz-14 w-120">Ticker Code</th >
        <th className="text-center fz-14 w-80" > Order Side </th>
        <th className="text-center fz-14 w-80" >Order Type </th>
        <th className="text-end fz-14 w-100p"> Order Quantity </th>
        <th className="text-end fz-14 w-120 " >Order Price </th>
        <th className="text-end fz-14 w-120" > Executed Quantity</th>
        <th className="text-end fz-14 w-120">Executed Price</th>
        <th className="text-end fz-14 w-120"> Matched Value</th>
        <th className="text-end fz-14 w-210"> Executed Datetime</th>
    </tr>)

    const _renderTradeHistoryTableBody = () => (
        listTradeSortDate.map((item: IListTradeHistoryAPI, index: number) => (
            <tr className="align-middle" key={index}>
                {teamCode && teamCode !== 'null' && (
                    <td className="td w-120">{item.account_id }</td>
                )}
                <td className="td w-100p">{item.external_order_id}</td>
                <td className="td text-center w-120" title={getTickerName(item.symbol_code)}>{getTickerCode(item.symbol_code)}</td>
                <td className="td text-center w-80">
                    <span className={`${item.order_side === tradingModelPb.Side.BUY ? 'text-danger' : 'text-success'}`}>
                        {getSideName(item.order_side)}
                    </span>
                </td>
                <td className="text-center w-80">{ORDER_TYPE.get(item.order_type)}</td>
                <td className="td text-end w-100p">{formatNumber(item.volume)}</td>
                <td className="td text-end w-120">{formatCurrency(item.price)}</td>
                <td className="td text-end w-120" >{formatNumber(item.exec_volume)}</td>
                <td className="td text-end w-120">{formatCurrency(item.exec_price)}</td>
                <td className="td text-end w-120">{formatCurrency(calcMatchedValue(item).toString())}</td>
                <td className="td text-end w-210">{formatOrderTime(Number(item.exec_time))}</td>
            </tr>
        ))
    )

    const calcMatchedValue = (item: IListTradeHistoryAPI) => {
        if (item) {
            return convertNumber(item.exec_price) * convertNumber(item.exec_volume);
        }
        return 0;
    }

    const getItemPerPage = (item: number) => {
        handleChangeItemPerPage(item)
    }

    const getCurrentPage = (item: number) => {
        handleChangePage(item)
    }

    const handleScroll = (e: any) => {
        if(paramSearch.page_size >= 150) {
            if(e.target.offsetHeight + e.target.scrollTop + 1 >= e.target.scrollHeight && !loading && !isLastPage) {
                setLoading(true)
                handleChangeNextPage()
            }
        }
    }

    const _renderTradeHistoryTable = () => (
        <div className="card-body">
            <div className="table-responsive mb-3">
                <table id="table" className="table table-sm table-hover mb-0 tableBodyScroll" cellSpacing="0" cellPadding="0">
                    <thead>
                        {_renderTradeHistoryTableHeader()}
                    </thead>
                    <tbody 
                        className={'mh-430px'} id="table-trade" 
                        onScroll={handleScroll}
                    >
                        {_renderTradeHistoryTableBody()}
                        {loading && (
                            <tr className="text-center">
                                <td className="spinner-border spinner-border-sm" role="status">
                                    <span className="sr-only"></span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <PaginationComponent totalItem={totalItem} itemPerPage={paramSearch.page_size || DEFAULT_ITEM_PER_PAGE} 
                currentPage={paramSearch.page_size === DEFAULT_ITEM_PER_PAGE ? 1 : paramSearch.page}
                getItemPerPage={getItemPerPage} getCurrentPage={getCurrentPage}
            />
        </div>
    )

    return (
        <>
            {_renderTradeHistoryTable()}
        </>
    )
}
export default TableTradeHistory