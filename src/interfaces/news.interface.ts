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
    meta: IMeta;
    data: IDataNews;
}

export interface IDataNews {
    count: number;
    page_size: number;
    next_page: number;
    prev_page: number;
    results: [INews]
}

export interface INews {
    id: number;
    title: string;
    content: string;
    read_flag: string;
    publish_date: string;
}