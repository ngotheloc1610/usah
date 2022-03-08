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

// declare fields of api
export interface IDataNews {
    count: number;
    page_size: number;
    next_page: number;
    prev_page: number;
    results: [INews];
    total_page: number;
}

// declare fields of api
export interface INews {
    id: number;
    title: string;
    content: string;
    read_flag: boolean;
    publish_date: string;
}