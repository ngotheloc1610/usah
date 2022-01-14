
import * as tdmpb from '../models/proto/trading_model_pb';
export const TradingModel: any = tdmpb;
export const Buy = TradingModel.OrderType.OP_BUY;
export const Sell = TradingModel.OrderType.OP_SELL;
export const FEMALE = 'Female';
export const MALE = 'Male';
export const SIDE = {
    Buy: 1,
    Sell: 2,
};
