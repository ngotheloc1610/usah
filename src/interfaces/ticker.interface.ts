export interface ITickerDetail {
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
    lotSize: string,
    minimumBizSize: string
}

export interface ISymbolList {
    symbolId: number;
    symbolCode: string;
    symbolName: string;
    calculationMode: number;
    contractSize: string;
    digits: number;
    exchange: string;
    currencyCode: string;
    description: string;
}