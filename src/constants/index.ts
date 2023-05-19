
import * as tdmpb from '../models/proto/trading_model_pb';
export const TradingModel: any = tdmpb;
export const Buy = TradingModel.OrderType.OP_BUY;
export const Sell = TradingModel.OrderType.OP_SELL;
export const FEMALE = 'Female';
export const MALE = 'Male';
export const SIDE = {
    buy: Buy,
    sell: Sell,
};
export const pageSizeTicker = 8;
export const pageFirst = 1;
export const success = 200;
export const unAuthorised = 401;
export const errorPastPassword = 1501;
export const multipleLoginFail = 1200;
export const deactiveAccount = 1400;

export const ORDER_RESPONSE = {
    REJECT: 'Reject',
    SUCCESS: 'Success',
};

export const INVALID_TOKEN = 'Invalid Token';

export const RESET_PASSWORD_SUCCESS = 'Reset password success';
