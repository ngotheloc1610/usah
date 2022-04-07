export interface IAuthen {
    access_token: string;
    account_id: string;
}

export interface IMeta {
    code: number;
    message: string;
}

export interface IDataLoginResquest {
    account_id: number;
    account_type: string;
    expire_time: string;
    access_token: string;
    sub_accounts?: string[];
    role: string;
    poem_id: string
}
export interface IDataLogin {
    meta: IMeta;
    data: IDataLoginResquest;
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
    orderSide: number;
    fromDate: number;
    toDate: number;
}
