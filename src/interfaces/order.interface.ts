import { IParamHistorySearch } from ".";

export interface ITickerInfo {
    symbolId: number;
    tickerName: string;
    ticker: string;
    stockPrice?: string;
    previousClose?: string;
    open?: string;
    high?: string;
    low?: string;
    lastPrice: string;
    volume: string;
    change: string;
    changePrecent: string;
    side?: string;
    tickSize?: string;
    minLot?: string;
    lotSize?: string;
    asks?: IAskAndBidPrice[];
    bids?: IAskAndBidPrice[];
    volumeStock?: string;
}
export interface IDetailTickerInfo {
    symbolId: number;
    change: number;
    high: string;
    lastPrice: string;
    low: string;
    open: string;
    percentChange: number;
    previousClose: string;
    symbolCode: string;
    symbolName: string;
    volume: string;
    side?: string;
}
export interface IParamOrder {
    orderId?: string;
    tickerCode: string;
    tickerName: string;
    orderType: string;
    volume: string;
    price: number;
    side: string;
    confirmationConfig: boolean;
    tickerId: string;
}

export interface IParamOrderModifyCancel {
    orderId?: string;
    tickerCode: string;
    tickerName: string;
    orderType: string;
    volume: string;
    price: number;
    side: number;
    confirmationConfig: boolean;
    tickerId: string;
}

export interface IOrderBook {
    askVol: string;
    price: string;
    bidPrice: string;
}

export interface IPropListOrderHistory {
    listOrderHistory: IOrderHistory[];
    paramHistorySearch: IParamHistorySearch;
}

export interface IPropListTradeHistory {
    getDataTradeHistory: IListTradeHistory[];
    isSearchData: boolean;
    changeStatusSearch: (status: boolean) => void;
}

export interface IStateListOrder {
    dateCurrent: string;
    setDateCurrent: string;
}

export interface IListOrder {
    amount: string;
    entry: string;
    executeMode: string;
    expireTime: string;
    fee: string;
    note: string;
    orderFilling: string;
    orderId: string;
    orderMode: number;
    orderTime: number;
    orderType: number;
    pl: string;
    price: string;
    reason: string;
    route: string;
    sl: string;
    slippage: string;
    state: string;
    swap: string;
    symbolCode: string;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: string;
    filledAmount: string;
    isChecked?: boolean;
    orderSideChange?: number;
    volumeChange?: string;
    priceChange?: string;
}

export interface IListOrderMonitoring {
    externalOrderId: string;
    amount: string;
    entry: string;
    executeMode: string;
    expireTime: string;
    fee: string;
    note: string;
    orderFilling: string;
    orderId: string;
    orderMode: number;
    orderTime: number;
    orderType: number;
    pl: string;
    price: string;
    reason: string;
    route: string;
    side: number;
    sl: string;
    slippage: string;
    state: string;
    swap: string;
    symbolCode: string;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: string;
    filledAmount: string;
    isChecked?: boolean;
    orderSideChange?: number;
    volumeChange?: string;
    priceChange?: string;
}

export interface IListOrderModifyCancel {
    externalOrderId: string;
    amount: string;
    entry: string;
    executeMode: string;
    expireTime: string;
    fee: string;
    note: string;
    orderFilling: string;
    orderId: string;
    orderMode: number;
    orderTime: number;
    orderType: number;
    pl: string;
    price: string;
    reason: string;
    route: string;
    side: number;
    sl: string;
    slippage: string;
    state: string;
    swap: string;
    symbolCode: string;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: string;
    filledAmount: string;
    isChecked?: boolean;
    orderSideChange?: number;
    volumeChange?: string;
    priceChange?: string;
}

export interface ISymbolMultiOrder {
    no: string;
    orderSide: string;
    price: string;
    ticker: string;
    volume: string;
    state?: number;
    status?: string;
}

export interface IListOrderHistory {
    amount: string;
    entry: string;
    executeMode: string;
    executedDatetime: string;
    expireTime: string;
    fee: string;
    lastPrice: string;
    note: string;
    orderFilling: string;
    orderId: string;
    orderMode: number;
    orderTime: number;
    orderType: number;
    pl: string;
    price: string;
    reason: string;
    route: string;
    sl: string;
    slippage: string;
    state: number;
    swap: string;
    symbolCode: string;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: string;
    filledAmount: string;
}

export interface IOrderHistory {
    amount: string;
    comment: string;
    currencyCode: string;
    entry: string;
    executeMode: string;
    executedDatetime: string;
    expireTime: string;
    fee: string;
    lastPrice: string;
    note: string;
    orderFilling: string;
    orderId: string;
    orderMode: number;
    orderTime: number;
    orderType: number;
    pl: string;
    price: string;
    reason: string;
    route: string;
    side: number;
    sl: string;
    slippage: string;
    state: number;
    swap: string;
    symbolCode: string;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: string;
    filledAmount: string;
    msgCode: number;
    withdrawAmount: string;
    externalOrderId: string;
}

export interface ITradeHistory {
    amount: string;
    executedDatetime: string;
    executedPrice: string;
    executedVolume: string;
    matchedValue: string;
    orderId: string;
    orderType: number;
    price: string;
    tickerCode: string;
    tickerName: string;
}

export interface IListTradeHistory {
    amount: string;
    executedDatetime: string;
    executedPrice: string;
    executedVolume: string;
    matchedValue: string;
    orderId: string;
    orderType: number;
    price: string;
    side: number;
    tickerCode: string;
    tickerName: string;
    externalOrderId: string;
}

export interface IFixListTradeHistory {
    orderQuatity: string;
    executedDatetime: string;
    executedPrice: string;
    executedQuatity: string;
    matchedValue: string;
    orderId: string;
    orderType: string;
    orderPrice: string;
    orderSide?: string;
    tickerCode: string;
    tickerName: string;
}

export interface TickerInfo {
    symbolId: number;
    tickerName: string;
    ticker: string;
    stockPrice: string;
    previousClose: string;
    open: string;
    high: string;
    low: string;
    lastPrice: string;
    volume: string;
    change: string;
    changePrecent: string;
}
export interface IAskAndBidPrice {
    price: string;
    volume: string;
    tradable: boolean;
    numOrders: number;
    symbolCode?: string;
    side?: string;
}

export interface ILastQuote {
    asksList: IAskAndBidPrice[];
    bidsList: IAskAndBidPrice[];
    close?: string;
    currentPrice: string;
    high?: string;
    low?: string;
    netChange?: string;
    open?: string;
    pctChange: string;
    quoteTime: number;
    scale: number;
    symbolCode: string;
    symbolId: number;
    tickPerDay: number;
    volumePerDay: string;
    volume: string;
    ticker?: string;
}

export interface IWatchList {
    symbolCode: string;
    accountId: string;
}

export interface IOrderTradeHistory {
    oderId: string;
    tickerCode: string;
    tickerName: string;
    side: string;
    orderType: string;
    orderVolume: string;
    orderPrice: string;
    executedVolume: string;
    executedPrice: string;
    matchedValue: string;
    excutedDatetime: string;
}

export interface IParamTradeSearch {
    ticker: string;
    orderType: number;
    fromDatetime: string;
    toDatetime: string;
}

export interface IListPortfolio {
    accountId: number;
    avgBuyPrice: string;
    avgSellPrice: string;
    currencyCode: string;
    currentValue: string;
    investedValue: string;
    marketPrice: string;
    realizedPl: string;
    symbolCode: string;
    totalBuyVolume: number;
    totalSellVolume: number;
    unrealizedPl: string;
}

export interface ITickerPortfolio {
    companyName: string;
    ticker: string;
    ownedVolume: string;
    orderPendingVolume: number;
    avgPrice: string;
    investedValue: string;
    marketPrice: string;
    curentValue: string;
    pl: string;
    plPercent: number;
}

export interface IHistorySearchStatus {
    code: number;
    name: string;
}

export interface IStyleBidsAsk {
    earmarkSpreadSheet: boolean;
    spreadsheet: boolean;
    grid: boolean;
    columns: boolean;
    columnsGap: boolean;
}

export interface IPropsListBidsAsk {
    styleListBidsAsk: IStyleBidsAsk;
    symbolCode: string;
    getTicerLastQuote: (item: IAskAndBidPrice) => void;
    handleSide: (side: number) => void;
}

export interface IPropsDetail {
    symbolCode: string;
}
export interface IListAskBid {
    totalBids: string;
    numberBids: string;
    bidPrice: string;
    askPrice: string;
    numberAsks: string;
    totalAsks: string;
    tradableAsk: boolean;
    tradableBid: boolean;
    volumeAsk: string;
    volumeBid: string;
}

export interface IAsksBidsList {
    numOrders: string;
    price: string;
    tradable: boolean;
    volume: string;
    total: string;
}

export interface ITickerBindingOrder {
    symbolCode: string;
    symbolName: string;
}

export interface ITradingAccountVertical {
    ticker: string;
    holdingVolume: any[];
    totalNetPosition: string;
    totalGrossTransactions: string;
    totalPl: number;
}

export interface IPortfolio {
    accountId: number;
    avgBuyPrice: string;
    avgPrice: string;
    avgSellPrice: string
    currencyCode: string
    currentValue: string;
    investedValue: string;
    marketPrice: string;
    ownedAmount: string;
    ownedVolume: number;
    realizedPl: string;
    symbolCode: string;
    totalBuyVolume: number;
    totalSellVolume: number;
    totalBuyAmount: string;
    totalSellAmount: string;
    totalVolume: number;
    unrealizedPl: string;
}

export interface IPortfolioDownLoad {
    tickerCode: string;
    ownedVol: number;
    avgPrice: number;
    dayNotional: number;
    marketPrice: number;
    currentValue: number;
    unrealizedPl: number;
    percentUnrealizedPl: string;
    transactionVol: number;
}
export interface ITotalNetFollowAccountId {
    title: string;
    totalNetFollowAccountId: string[];
    totalNetRow: string;
}

export interface ITotalGrossFollowAccountId {
    title: string;
    totalGrossFollowAccountId: string[];
    totalGrossRow: string;
}

export interface ITotalPLFollowAccountId {
    title: string;
    totalPlFollowAccountId: string[];
    totalPlRow: string;
}

export interface ISymbolInfo {
    calculationMode: number;
    ceiling: string;
    contractSize: number;
    currencyCode: string;
    description: string;
    digits: number;
    exchange: string;
    floor: string;
    limitRate: string;
    lotSize: string;
    minLot: string;
    spread: string;
    symbolCode: string;
    symbolId: number;
    symbolName: string;
    symbolStatus: number;
    tickSize: string;
    prevClosePrice: string;
}

export interface ISymbolQuote {
    open: string;
    high: string;
    low: string;
    lastPrice: string;
    volume: string;
    symbolCode: string;
    symbolId: number;
    symbolName: string;
    prevClosePrice: string;
    ceiling: string;
    floor: string;
}

export interface IOrderListResponse {
    msgCode: number;
    amount: string;
    currencyCode: string;
    entry: number;
    executeMode: number;
    executedDatetime: string;
    expireTime: number;
    externalOrderId: string;
    fee: string;
    filledAmount: string;
    lastPrice: string;
    note: string;
    orderFilling: number;
    orderId: string;
    orderMode: number;
    orderTime: number;
    orderType: number;
    pl: string;
    price: string;
    reason: number;
    route: number;
    side: number;
    sl: string;
    slippage: string;
    state: number;
    swap: string;
    symbolCode: string;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: number;
}

export interface IDataHistory {
    orderId: number;
    tickerCode: string;
    tickerName: string;
    orderSide: string;
    orderStatus: string;
    orderType: string;
    orderVolume: string;
    remainingVolume: string;
    executedVolume: string;
    orderPrice: string;
    lastPrice: string;
    orderDateTime: string;
    executedDateTime: string;
}


export interface IDataHistoryDownload {
    orderId: string;
    tickerCode: string;
    tickerName: string;
    orderSide: string;
    orderStatus: string;
    orderType: string;
    orderVolume: number;
    remainingVolume: number;
    executedVolume: number;
    orderPrice: number;
    lastPrice: number;
    orderDateTime: string;
    executedDateTime: string;
}

export interface ITradeHistoryDownload {
    orderQuatity: number;
    executedDatetime: string;
    executedPrice: number;
    executedQuatity: number;
    matchedValue: number;
    orderId: string;
    orderType: string;
    orderPrice: number;
    orderSide?: string;
    tickerCode: string;
    tickerName: string;
}
export interface IParamSearchTradeHistory {
    symbolCode: string;
    side: number;
    fromDate: number;
    toDate: number;
}
export interface IPropsSearchTradeHistory {
    getParamSearch: (item: IParamSearchTradeHistory) => void
}

export interface IState {
    name: string;
    code: number;
}
