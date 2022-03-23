export interface IAuthen {
    access_token: string;
    account_id: string;
}

export interface IMeta {
    code: number;
    message: string;
}

export interface IDataLogin {
    account_id: number;
    account_type: string;
    expire_time: string;
    access_token: string;
    sub_accounts?: string[]; 
}
export interface IDataLogin {
    meta: IMeta;
    data: IDataLogin;
}

export interface IReqLogin {
    config: string;
    data: IDataLogin;
    headers: string;
    request: string;
    status: number;
    statusText: string;
}

export interface IParamHistorySearch {
    symbolCode: string;
    orderState: number;
    orderSideBuy: string;
    orderSideSell: string;
    fromDate: number;
    toDate: number;
}
