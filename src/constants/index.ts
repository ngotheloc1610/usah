
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

export const REQUEST_SUCCESS = 'Request success';
export const REJECT = 'Reject';
export const SUCCESS = 'Success';
