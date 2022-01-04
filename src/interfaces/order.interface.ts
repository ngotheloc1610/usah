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