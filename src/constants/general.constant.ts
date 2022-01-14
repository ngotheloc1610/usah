import * as tspb from '../models/proto/trading_model_pb'
const tradingModelPb: any = tspb;

export const SIDE = [
    {
        title: 'Buy',
        code: 100
    },
    {
        title: 'Sell',
        code: 101
    }
]
export const STATE = [
    {
        title: 'Working',
        code: tradingModelPb.OrderState.ORDER_STATE_PLACED
    },
    {
        title: 'Canceled',
        code: tradingModelPb.OrderState.ORDER_STATE_CANCELED
    },
    {
        title: 'Working',
        code: tradingModelPb.OrderState.ORDER_STATE_PARTIAL
    },
    {
        title: 'Filled',
        code: tradingModelPb.OrderState.ORDER_STATE_FILLED
    },
    {
        title: 'Rejected',
        code: tradingModelPb.OrderState.ORDER_STATE_REJECTED
    }
]
export const INVALID_DATE = 'Invalid date';
export const FORMAT_DATE_TIME_MILLI = 'MMM DD YYYY HH:mm:ss.SSS';

export const RESPONSE_RESULT = {
    success: 1,
    error: 2
}

export const SIDE_NAME = {
    buy: 'buy',
    sell: 'sell'
}

export const MARKET_DEPTH_LENGTH = 3;
export const OBJ_AUTHEN = 'objAuthen';
export const MSG_CODE = 'msgCode';
export const MSG_TEXT = 'msgText';
export const TITLE_CONFIRM = {
    modify: 'Modify',
    cancel: 'Cancel',
    newOrder: 'New order confirmation'
};
export const ORDER_TYPE = {
    limit: {id: 1, name: 'limit'}
}
