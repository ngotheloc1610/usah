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
}
export interface IParamOrder {
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

export interface IPropListOrder {
    listOrder: IListOrder[];
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

export interface IBidPrice {
    numOrders: number;
    price: string;
    tradable: boolean;
    volume: string;
}

export interface IAskPrice {
    price: string;
    volume: string;
    tradable: boolean;
    numOrders: number;
}

export interface ILastQuote {
    asksList: IAskPrice[];
    bidsList: IBidPrice[];
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

export interface IOrderPortfolio {
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