import * as tmpb from "../../../models/proto/trading_model_pb"
import SearchTradeHistory from './SearchTradeHistory'
import TableTradeHistory from './TableTradeHistory'
import '../OrderHistory/orderHistory.scss'
import { useState,} from 'react';
import { ACCOUNT_ID, FROM_DATE_TIME, TO_DATE_TIME, DEFAULT_ITEM_PER_PAGE, START_PAGE, FORMAT_DATE, } from '../../../constants/general.constant';
import { convertDatetoTimeStamp } from '../../../helper/utils';
import { IParamSearchTradeHistory, IParamSearchComponentTradeHistory } from "../../../interfaces/order.interface";
import moment from "moment";

const OrderTradeHistory = () => {
    const tradingModelPb: any = tmpb;
    // in firefox not support parse date to timestamp when day and month over 2 number (2023-010-05) 
    const today = moment().format(FORMAT_DATE);
    const fromDateDefault = convertDatetoTimeStamp(today, FROM_DATE_TIME);
    const toDateDefault = convertDatetoTimeStamp(today, TO_DATE_TIME);

    const [isSearchData, setIsSearchData] = useState(false);
    const [isDownload, setIsDownload] = useState(false)
    const [isUnAuthorised, setIsUnAuthorised] = useState(false)

    const accoutId = sessionStorage.getItem(ACCOUNT_ID) || ''
    
    const paramSearchDefault = {
        symbol_code: '',
        order_side: 0,
        from_time: fromDateDefault,
        to_time: toDateDefault,
        order_type: tradingModelPb.OrderType.OP_NONE,
        account_id: accoutId,
        page: START_PAGE, 
        page_size: DEFAULT_ITEM_PER_PAGE,
    }

    const [paramSearch, setParamSearch] = useState<IParamSearchTradeHistory>(paramSearchDefault)

    const getParamSearch = (param: IParamSearchComponentTradeHistory) => {
        const tmpParam = {
            ...paramSearch,
            ...param,
            page: START_PAGE,
        }
        setParamSearch(tmpParam)
    }

    const changeStatusSearch = (value: boolean) => {
        setIsSearchData(value);
    }

    const handleDownload = (value: boolean) => {
        setIsDownload(value)
    }

    const handleChangeNextPage = () => {
        setParamSearch(prev => ({
            ...prev,
            page: prev.page + 1
        }))
    }

    const handleChangePage = (value: number) => {
        setParamSearch(prev => ({
            ...prev,
            page: value
        }))
    }

    const handleChangeItemPerPage = (value: number) => {
        setParamSearch(prev => ({
            ...prev,
            page: START_PAGE,
            page_size: value
        }))
    }

    const handleUnAuthorisedAcc = (value: boolean) => {
        setIsUnAuthorised(value)
    }

    const _renderTradeHistory = () => {
        return (
            <div className="site-main">
                <div className="container">
                    <div className="card shadow-sm mb-3">
                        <SearchTradeHistory getParamSearch={getParamSearch} handleDownload={handleDownload} isUnAuthorised={isUnAuthorised}/>
                        <TableTradeHistory 
                            isSearchData={isSearchData} 
                            changeStatusSearch={changeStatusSearch} 
                            isDownload={isDownload} 
                            resetStatusDownload={handleDownload}
                            paramSearch={paramSearch}
                            handleChangePage={handleChangePage}
                            handleChangeNextPage={handleChangeNextPage}
                            handleChangeItemPerPage={handleChangeItemPerPage}
                            handleUnAuthorisedAcc={handleUnAuthorisedAcc}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            {_renderTradeHistory()}
        </div>
    )
}
export default OrderTradeHistory