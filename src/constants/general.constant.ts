import * as tspb from '../models/proto/trading_model_pb'
const tradingModelPb: any = tspb;

export const SIDE = [
    {
        title: 'Buy',
        code: Number(tradingModelPb.Side.BUY),
    },
    {
        title: 'Sell',
        code: Number(tradingModelPb.Side.SELL)
    }
];

export const STATE = [
    {
        name: 'All',
        code: tradingModelPb.OrderState.ORDER_STATE_NONE
    },
    {
        name: 'Order Received',
        code: tradingModelPb.OrderState.ORDER_STATE_PLACED
    },
    {
        name: 'Partially Done',
        code: tradingModelPb.OrderState.ORDER_STATE_PARTIAL
    },
    {
        name: 'Withdraw Done ',
        code: tradingModelPb.OrderState.ORDER_STATE_CANCELED
    },
    {
        name: 'Done',
        code: tradingModelPb.OrderState.ORDER_STATE_FILLED
    },
    {
        name: 'Rejected',
        code: tradingModelPb.OrderState.ORDER_STATE_REJECTED
    },
    {
        name: "Amend Done",
        code: tradingModelPb.OrderState.ORDER_STATE_MODIFIED
    }
];
export const INVALID_DATE = 'Invalid date';

export const FORMAT_DATE = 'YYYY-MM-DD';

export const FORMAT_DATE_NEW_OR_RESULT = 'MMMM DD, YYYY';

export const FORMAT_DATE_DOWLOAD = 'YYYYMMDD_HH:mm:ss';

export const FORMAT_DATE_TIME_MILLIS = 'MMM DD YYYY HH:mm:ss.SSS';

export const RESPONSE_RESULT = {
    success: 1,
    error: 2
};

export const SIDE_NAME = {
    buy: 'buy',
    sell: 'sell'
};

export const MARKET_DEPTH_LENGTH = 3;

export const MSG_CODE = 'msgCode';

export const MSG_TEXT = 'msgText';

export const SYMBOL_LIST = 'symbol-list';

export const LIST_PRICE_TYPE = {
    askList: 'askList',
    bidList: 'bidList'
}

export const TITLE_CONFIRM = {
    modify: 'Modify',
    cancel: 'Cancel',
    newOrder: 'New Order Confirmation'
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

export const LENGTH_PASSWORD = 8;

export const MAX_LENGTH_PASSWORD = 20;

export enum ERROR_MSG_VALIDATE {
    TRADING_PIN_EXIST = 'Trading PIN already exist',
    TRADING_PIN_INCORRECT = 'Incorrect confirm trading Pin',
    TRADING_PIN_NOT_VALID = 'Trading PIN must be a six-digit number',

    DUPPLICATE_PASSWORD = 'Current password and new passwords cannot be the same',
    PASSORD_INCORRECT = 'Incorrect confirm new password'
};

export const SOCKET_CONNECTED = 'SOCKET_CONNECTED';

export const SOCKET_RECONNECTED = 'SOCKET_RECONNECTED';

export const FROM_DATE_TIME = '00:00:00';

export const TO_DATE_TIME = '23:59:59';

export enum MESSAGE_TOAST {
    SUCCESS_SEARCH = 'Search successfully',
    SUCCESS_PLACE = 'Place order successfully',
    SUCCESS_PASSWORD_UPDATE = 'Update password successfully',

    SUCCESS_CANCEL = 'Cancel order successfully',
    SUCCESS_MODIFY = 'Modify order successfully',

    SUCCESS_ADD = 'Add symbol successfully',

    ERROR_PASSWORD_UPDATE = 'Update password error',
    ERROR_ADD = 'Add symbol failed',

    EXIST_ADD = 'Symbol already existed'
};

export const LIST_TICKER_INFO = 'TICKER_LIST';

export const LIST_TICKER_ALL = 'TICKER_LIST_ALL';

export const ADMIN_NEWS_FLAG = 'ADMIN_NEWS_FLAG';

export const MATCH_NOTI_FLAG = 'MATCH_NOTI_FLAG';

export const LIST_WATCHING_TICKERS = 'LIST_WATCHING_TICKERS';

export const ACCOUNT_ID = 'account_id';

export const POEM_ID = 'poem_id';

export const EXPIRE_TIME = 'expire_time';

export const SUB_ACCOUNTS = 'sub_accounts';

export const TIME_ZONE = 'time_zone'

export const ROLE = 'role';

export const START_PAGE = 1;

export const PAGE_SIZE = 10;

export const DEFAULT_ITEM_PER_PAGE = 10;

export const DEFAULT_TIME_ZONE = 'SG';

export const STATUS_ORDER = {
    success: 'SUCCESS',
    rejected: 'REJECTED'
};

export const ROLE_ACCOUNT_DETAIL = {
    monitor: 'monitor',
    trader: 'trader'
};

export enum TITLE_ORDER_CONFIRM {
    TICKER = 'Ticker',
    SIDE = 'Side',
    VOLUME = 'Volume',
    QUANLITY = 'Quantity',
    PRICE = 'Price',
    VALUE = 'Value'
};

export const CURRENCY = {
    usd: 'US$',
    sgd: 'S$'
};

export const SECRET_KEY = 'secret_key';
export const REMEMBER_KEY = 'remember_key';
export const IS_REMEMBER_ME = 'isRememberMe';
