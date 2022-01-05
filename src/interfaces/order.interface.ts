export interface IParamOrder {
    tickerCode: string;
    tickerName: string;
    orderType: string;
    volume: number;
    price: number;
    side: string;
    confirmationConfig: boolean;
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
    symbolCode: string;
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