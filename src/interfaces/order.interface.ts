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
    time: string;
    tp: string;
    triggerPrice: string;
    uid: string;
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

