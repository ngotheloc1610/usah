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
    calculationMode: number,
    contractSize: number,
    currencyCode: string,
    description: string,
    digits: number,
    exchange: string,
    lotSize: string,
    minLot: string,
    symbolCode: string,
    symbolId: number,
    symbolName: string,
    tickSize: string
}

export interface IListDashboard {
    symbolName: string,
    symbolCode: string,
    previousClose?: string,
    open?: string,
    high?: string,
    low?: string,
    lastPrice?: string,
    volume?: string,
    change: number,
    percentChange: number,

}