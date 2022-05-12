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

export interface IReqChangePassword {
    config: string;
    data: IDataChangePassword;
    headers: string;
    request: string;
    status: number;
    statusText: string;
}

export interface IDataChangePassword {
    meta: IMeta;
    data: IDataChangePasswordRequest;
}

export interface IDataChangePasswordRequest {
    meta: string;
    data: {
        password: string,
        new_password: string,
    }
}
export interface IParamHistorySearch {
    symbolCode: string;
    orderState: number;
    orderSide: number;
    fromDate: number;
    toDate: number;
}

export interface IClientHoldingInfoReq {
    data: {
        meta: IMeta;
        data: IClientHoldingInforData[];
    };
}
export interface IClientHoldingInforData {
    symbol: string;
    symbolsfx: string;
    ownQty: number;
}
