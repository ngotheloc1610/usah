import { IAskAndBidPrice } from "./order.interface";

export interface IQuoteEvent {
    id: number;
    symbolId: number;
    symbolCode: string;
    asksList: IAskAndBidPrice[];
    bidsList: IAskAndBidPrice[];
    low: string;
    high: string;
    open: string;
    close: string;
    netChange: string;
    pctChange: string;
    scale: number;
    quoteTime: number; // Timestamp in millisecond
    tickPerDay: number;
    volumePerDay: string;
    currentPrice: string;   
}