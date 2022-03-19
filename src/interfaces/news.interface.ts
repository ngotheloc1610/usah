import { NumberLiteralType } from "typescript";
import { IMeta } from ".";

export interface INewsNav {
    title: string;
    unRead: string;
    active: boolean;
}

export interface INotificationList {
    unRead: boolean;
    state: boolean;
    content: string;
}

export interface INotificationDetail {
    title: string;
    date: string;
    content: string;
}
export interface IReqNews {
    config: string;
    data: {
        meta: IMeta;
        data: IDataNews;
    }
    status: number;
}

export interface IReqTradingResult {
    config: string;
    data: {
        meta: IMeta;
        data: IDataTradingResult;
    }
    status: number;
}

// declare fields of api
export interface IDataNews {
    count: number;
    page_size: number;
    next_page: number;
    prev_page: number;
    results: [INews];
    total_page: number;
}

export interface IDataTradingResult {
    count: number;
    page_size: number;
    next_page: number;
    prev_page: number;
    results: [ITradingResult];
    total_page: number;
}

// declare fields of api
export interface INews {
    id: number;
    poemId: string;
    newsTitle: string;
    newsGroup: string;
    newsContent: string;
    newsStatus: string;
    publishDate: string;
    active: boolean;
    read_flag: boolean;
    createDate: string;
}

export interface ITradingResult {
    id: number;
    accountId: string;
    tradingId: string;
    orderId: string;
    matchedOrderId: string;
    symbolId: string;
    symbolCode: string;
    orderType: string;
    orderSide: string;
    price: number;
    volume: number;
    execPrice: number;
    execVolume: number;
    execTime: string;
    currencyCode: string;
    createUid: number;
    createDate: string;
    writeUid: number;
    writeDate: string;
    read_flag?: boolean;
}