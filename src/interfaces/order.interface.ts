export interface ITickerInfo {
    symbolId: number,
    tickerName: string,
    ticker: string,
    stockPrice: string,
    previousClose: string,
    open: string,
    high: string,
    low: string,
    lastPrice: string,
    volume: string,
    change: string,
    changePrecent: string,
    side?: string,
}

export interface IParamOrder {
    orderId?: string;
    tickerCode: string;
    tickerName: string;
    orderType: string;
    volume: number;
    price: number;
    side: string;
    confirmationConfig: boolean;
    tickerId: string;
}

export interface IOrderBook {
    askVol: string;
    price: string;
    bidPrice: string;
}

export interface IPropListOrderHistory {
    listOrderHistory: IListOrderHistory[]
}

export interface IPropListTradeHistory {
    getDataTradeHistory: ITradeHistory[]
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
    symbolCode: number;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: string;
    filledAmount: string;
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
    symbolCode: number;
    time: number;
    tp: string;
    triggerPrice: string;
    uid: string;
    filledAmount: string;
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

export interface TickerInfo {
    symbolId: number,
    tickerName: string,
    ticker: string,
    stockPrice: string,
    previousClose: string,
    open: string,
    high: string,
    low: string,
    lastPrice: string,
    volume: string,
    change: string,
    changePrecent: string,
}
export interface IAskAndBidPrice {
    price: string;
    volume: string;
    tradable: boolean;
    numOrders: number;
    symbolCode: string;
    side?: string;
}

export interface ILastQuote {
    asksList: IAskAndBidPrice[];
    bidsList: IAskAndBidPrice[];
    close: string;
    currentPrice: string;
    high: string;
    id: number;
    low: string;
    netChange: string;
    open: string;
    pctChange: string;
    quoteTime: number;
    scale: number;
    symbolCode: string;
    symbolId: number;
    tickPerDay: number;
    volumePerDay: string;
}

export interface IOrderHistory {
    orderId: string,
    ticker: string,
    companyName: string,
    side: string,
    orderStatus: string,
    orderType: string,
    orderVolume: string,
    remainVolume: string,
    executedVolume: string,
    orderPrice: string,
    lastPrice: string,
    orderDatetime: string,
    excutedDatetime: string
}

export interface IOrderTradeHistory {
    oderId: string,
    tickerCode: string,
    tickerName: string,
    side: string,
    orderType: string,
    orderVolume: string,
    orderPrice: string,
    executedVolume: string,
    executedPrice: string,
    matchedValue: string,
    excutedDatetime: string
}

export interface IParamTradeSearch {
    ticker: string,
    orderType: number,
    fromDatetime: string,
    toDatetime: string,
}

export interface IPropsListPortfolio {
    accountPortfolio: IListPortfolio[]
}

export interface IListPortfolio {
    accountId: number,
    avgPrice: string,
    currencyCode: string,
    currentValue: string,
    investedValue: string,
    marketPrice: string,
    ownedVolume: string,
    pendingVolume: string,
    realizedPl: string,
    symbolCode: string,
    unrealizedPl: string
}

export interface ITickerPortfolio {
    companyName: string,
    ticker: string,
    ownedVolume: string,
    orderPendingVolume: number,
    avgPrice: string,
    investedValue: string,
    marketPrice: string,
    curentValue: string,
    pl: string,
    plPercent: number
}

export interface IParamHistorySearch {
    ticker: string,
    orderState: number
    orderType: number,
    fromDatetime: string,
    toDatetime: string,
}

export interface IHistorySearchStatus {
    code: number,
    name: string
}