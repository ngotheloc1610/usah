import * as tspb from '../models/proto/trading_model_pb'
const tradingModelPb: any = tspb;

export const SIDE = [
    {
        title: 'Buy',
        code: Number(tradingModelPb.OrderType.OP_BUY),
    },
    {
        title: 'Sell',
        code: Number(tradingModelPb.OrderType.OP_SELL)
    }
];

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
];
export const INVALID_DATE = 'Invalid date';

export const FORMAT_DATE_TIME_MILLI = 'MMM DD YYYY HH:mm:ss.SSS';

export const RESPONSE_RESULT = {
    success: 1,
    error: 2
};

export const SIDE_NAME = {
    buy: 'buy',
    sell: 'sell'
};

export const MARKET_DEPTH_LENGTH = 3;

export const OBJ_AUTHEN = 'objAuthen';

export const MSG_CODE = 'msgCode';

export const MSG_TEXT = 'msgText';

export const SYMBOL_LIST = 'symbol-list';

export const TITLE_CONFIRM = {
    modify: 'Modify',
    cancel: 'Cancel',
    newOrder: 'New order confirmation'
};

export const ORDER_TYPE = [
    { id: 1, name: 'Limit' }
];

export const ORDER_TYPE_NAME = {
    limit: 'Limit'
};

export const KEY_LOCAL_STORAGE = {
    AUTHEN: 'objAuthen'
};

export const MODIFY_CANCEL_STATUS = {
    success: true,
    error: false
};

export enum ERROR_MSG_VALIDATE {
    TRADING_PIN_EXIST = 'Trading PIN already exist',
    TRADING_PIN_INCORRECT = 'Incorrect confirm trading Pin',
    TRADING_PIN_NOT_VALID = 'Trading PIN must be a six-digit number',

    PASSWORD_EXIST = 'Password already exist',
    PASSORD_INCORRECT = 'Incorrect confirm new password'
};

export const SOCKET_CONNECTED = 'SOCKET_CONNECTED';

export const FROM_DATE_TIME = '00:00:00';

export const TO_DATE_TIME = '23:59:59';

export enum MESSAGE_TOAST {
    SUCCESS_SEARCH = 'Search successfully',
    SUCCESS_PLACE = 'Place order successfully',
    SUCCESS_UPDATE = 'Update successfully',

    ERROR_UPDATE = 'Update error'
};

export const CURRENT_CHOOSE_TICKER = 'tickerDetail';

export const IS_ACTIVE_TRADING_PIN = 'isActiveTradingPin';