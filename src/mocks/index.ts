import { ITickerInfo, IHistorySearchStatus, ILastQuote, ISymbolInfo } from "../interfaces/order.interface";
import { IReportList } from "../interfaces/report.interface"
import { INewsNav, INotificationList, INotificationDetail, INews, } from "../interfaces/news.interface"
import * as tdpb from '../models/proto/trading_model_pb';
import { ITickerDetail } from "../interfaces/ticker.interface";
import { IParamHistorySearch } from "../interfaces";

export const TradingModel: any = tdpb;

export const DEFAULT_DATA_TICKER: ILastQuote = {
    asksList: [],
    bidsList: [],
    close: '',
    currentPrice: '',
    high: '',
    low: '',
    netChange: '',
    open: '',
    pctChange: '',
    quoteTime: 0,
    scale: 0,
    symbolCode: '',
    symbolId: 0,
    tickPerDay: 0,
    volumePerDay: '',
    volume: ''
}

export const defaultTicker: ITickerInfo = {
    symbolId: 0,
    tickerName: '',
    ticker: '',
    lastPrice: '',
    volume: '',
    change: '',
    changePrecent: '',
}

export const ORDER_BOOK_HEADER = ['ask volume', 'price', 'bid volume'];


export const ORDER_HISTORY_SEARCH_STATUS: IHistorySearchStatus[] = [
    {
        code: TradingModel.OrderState.ORDER_STATE_NONE,
        name: "All"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_PLACED,
        name: "Working"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_CANCELED,
        name: "Canceled"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_FILLED,
        name: "Filled"
    },
    {
        code: TradingModel.OrderState.ORDER_STATE_REJECTED,
        name: "Rejected"
    },
]

export const REPORT_LIST: IReportList[] = [
    {
        name: 'Monthly_Report_20211201',
        type: 'Monthly',
        date: 'Dec 01 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211202',
        type: 'Daily',
        date: 'Dec 02 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211203',
        type: 'Daily',
        date: 'Dec 03 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211204',
        type: 'Daily',
        date: 'Dec 04 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211205',
        type: 'Daily',
        date: 'Dec 05 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211206',
        type: 'Daily',
        date: 'Dec 06 2021',
        status: 'Done'
    },
    {
        name: 'Daily_Report_20211207',
        type: 'Daily',
        date: 'Dec 07 2021',
        status: 'Not Yet'
    }

]

export const LIST_NEWS_NAV: INewsNav[] = [
    {
        title: 'Admin News',
        unRead: '02',
        active: true
    },
    {
        title: 'Trading Results',
        unRead: '0',
        active: false
    },
]

export const DEFAULT_CURRENT_TICKER: ITickerInfo = {
    symbolId: 0,
    tickerName: '',
    ticker: '',
    stockPrice: '',
    previousClose: '',
    open: '',
    high: '',
    low: '',
    lastPrice: '',
    volume: '',
    change: '',
    changePrecent: '',
    side: '',
}

// TODO: Don't have MatchingHistory message in proto so use fake data
export const DATA_MATCHING_DETAIL = [
    {
        subNo: 1,
        orderId: 10002333,
        ticker: 'AAPL',
        orderStatus: 'Accepted',
        side: 100,
        type: 'Limit',
        orderPrice: '158.43',
        orderVolume: '2000',
        exPrice: '',
        exVolume: '',
        remainVolume: '2,000',
        date: 'Dec 2 2021 10:01:50',
        comment: '',
    },
    {
        subNo: 2,
        orderId: 10002333,
        ticker: 'AAPL',
        orderStatus: 'Modified',
        side: 100,
        type: 'Limit',
        orderPrice: '158.43',
        orderVolume: '1000',
        exPrice: '158.45',
        exVolume: '',
        remainVolume: '1,000',
        date: 'Dec 2 2021 10:01:50',
        comment: '',
    },
    {
        subNo: 3,
        orderId: 10002333,
        ticker: 'AAPL',
        orderStatus: 'Partial',
        side: 100,
        type: 'Limit',
        orderPrice: '158.43',
        orderVolume: '1000',
        exPrice: '158.45',
        exVolume: '300',
        remainVolume: '1,000',
        date: 'Dec 2 2021 10:01:50',
        comment: 'Change order price',
    },
    {
        subNo: 4,
        orderId: 10002333,
        ticker: 'AAPL',
        orderStatus: 'Filled',
        side: 100,
        type: 'Limit',
        orderPrice: '158.43',
        orderVolume: '1000',
        exPrice: '158.45',
        exVolume: '700',
        remainVolume: '1,000',
        date: 'Dec 2 2021 10:01:50',
        comment: '',
    }
]

export const DEFAULT_TICKER_INFO: ITickerDetail = {
    symbolId: 0,
    tickerName: '',
    ticker: '',
    stockPrice: '',
    previousClose: '',
    open: '',
    high: '',
    low: '',
    lastPrice: '',
    volume: '',
    change: '',
    changePrecent: '',
    lotSize: '',
    minimumBizSize: '',
}

export const DEFAULT_DETAIL_NEWS: INews = {
    id: 0,
    poemId: '',
    newsTitle: '',
    newsGroup: '',
    newsContent: '',
    newsStatus: '',
    publishDate: '',
    active: false,
    read_flag: false,
    createDate: ''
}

export const DEFAULT_SYMBOL: ISymbolInfo = {
    calculationMode: 0,
    ceiling: "0",
    contractSize: 0,
    currencyCode: "",
    description: "",
    digits: 0,
    exchange: "",
    floor: "0",
    limitRate: "0",
    lotSize: "0",
    minLot: "0",
    spread: "0",
    symbolCode: "",
    symbolId: 0,
    symbolName: "",
    symbolStatus: 0,
    tickSize: "0",
    prevClosePrice: '0'
}

export const DEFAULT_SEARCH_HISTORY: IParamHistorySearch = {
    symbolCode: '',
    orderState: 0,
    orderSide: 0,
    fromDate: 0,
    toDate: 0,
}