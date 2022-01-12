export interface INewsNav {
    title: string,
    unRead: string,
    active: boolean
}

export interface INotificationList {
    unRead: boolean,
    state: boolean,
    title: string,
    content: string
}

export interface INotificationDetail {
    title: string,
    date: string,
    content: string
}
