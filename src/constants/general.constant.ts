import * as tspb from '../models/proto/trading_model_pb';
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
        name: 'Partially Done',
        code: tradingModelPb.OrderState.ORDER_STATE_MATCHED
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
export const STATE_HISTORY_SEARCH = [
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

export const ORDER_TYPE_SEARCH = [
    {
        name: 'All',
        code: tradingModelPb.OrderType.NONE
    },
    {
        name: 'Market',
        code: tradingModelPb.OrderType.OP_MARKET
    },
    {
        name: 'Limit',
        code: tradingModelPb.OrderType.OP_LIMIT
    }
]

export const INVALID_DATE = 'Invalid date';

export const FORMAT_DATE = 'YYYY-MM-DD';

export const FORMAT_DATE_NEW_OR_RESULT = 'MMMM DD, YYYY';

export const FORMAT_DATE_DOWLOAD = 'YYYYMMDD_HH:mm:ss';

export const FORMAT_DATE_TIME_MILLIS = 'MMM DD YYYY HH:mm:ss.SSS';

export const RESPONSE_RESULT = {
    success: 1,
    error: 2,
    warning: 3,
};

export const SIDE_NAME = {
    buy: 'buy',
    sell: 'sell'
};

export const MARKET_DEPTH_LENGTH_DASHBOARD = 10;

export const MARKET_DEPTH_LENGTH_ORDER_BOOK_DEFAULT = 15;

export const MARKET_DEPTH_LENGTH = 3

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

export const ORDER_TYPE = new Map([
    [tradingModelPb.OrderType.OP_LIMIT, 'Limit' ],
    [tradingModelPb.OrderType.OP_MARKET, 'Market']
]);

export const ORDER_TYPE_NAME = {
    limit: 'Limit'
};

export const KEY_LOCAL_STORAGE = {
    AUTHEN: 'lp_objAuthen',
    START_LOAD: 'startLoad',
    END_LOAD: 'endLoad'
};

export const KEY_SESSION_STORAGE = {
    SESSION: 'lp_session'
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

export const MESSAGE_TOAST = {
    SUCCESS_SEARCH: 'Search successfully',
    SUCCESS_PLACE: 'Place order successfully',
    SUCCESS_PASSWORD_UPDATE: 'Update password successfully',

    SUCCESS_CANCEL: 'Cancel order successfully',
    SUCCESS_MODIFY: 'Modify order successfully',

    SUCCESS_ADD: 'Add symbol successfully',

    ERROR_PASSWORD_UPDATE: 'Incorrect current password',
    ERROR_PASSWORD_SHOULD_DIFF: `New Password should be different from past ${window.globalThis.timesChangePassword} passwords.`,
    ERROR_ADD: 'Add symbol failed',

    EXIST_ADD: 'Symbol already existed'
};

export const LIST_TICKER_INFO = 'TICKER_LIST';

export const LIST_TICKER_ALL = 'TICKER_LIST_ALL';

export const ADMIN_NEWS_FLAG = 'ADMIN_NEWS_FLAG';

export const MATCH_NOTI_FLAG = 'MATCH_NOTI_FLAG';

export const LIST_WATCHING_TICKERS = 'LIST_WATCHING_TICKERS';

export const LIST_WATCHING_TICKERS_BIG = 'LIST_WATCHING_TICKERS_BIG';

export const ACCOUNT_ID = 'lp_account_id';

export const POEM_ID = 'lp_poem_id';

export const MIN_ORDER_VALUE = 'lp_min_order_value';

export const MAX_ORDER_VALUE = 'lp_max_order_value';

export const MAX_ORDER_VOLUME = 'lp_max_order_volume';

export const EXPIRE_TIME = 'lp_expire_time';

export const SUB_ACCOUNTS = 'lp_sub_accounts';

export const TIME_ZONE = 'time_zone'

export const ROLE = 'lp_role';

export const START_PAGE = 1;

export const PAGE_SIZE = 10;

export const DEFAULT_ITEM_PER_PAGE = 150;

export const MAX_ITEM_REQUEST = 500;

export const DEFAULT_TIME_ZONE = 'SG';

export const TEAM_CODE = 'team_code';

export const TEAM_ID = 'team_id';

export const TEAM_ROLE = 'team_role';

export const THEME_MARKET_SESSION = 'theme_market_session';

export const USAH = "US Asian Hours";

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
    VALUE = 'Value',
    ORDER_TYPE = 'Order Type'
};

export const CURRENCY = {
    usd: 'US$',
    sgd: 'S$'
};

export const SECRET_KEY = 'secret_key';
export const REMEMBER_KEY = 'remember_key';
export const IS_REMEMBER_ME = 'isRememberMe';

export const MARKET = 'US';

export const NOTE_RISK = 'Phillip Securities Pte Ltd. acts as principal and is the contractual counterparty with investors in the trades.';

export const NOT_MATCH_PASSWORD = "Passwords don't match";

export const RETURN_LOGIN_TIME = 5;

export const TIME_OUT_CANCEL_RESPONSE_DEFAULT = 10000;

export const TIME_OUT_MULTI_ORDER_RESPONSE_DEFAULT = 30000;

export const SORT_MONITORING_SCREEN = 'sort_monitor_screen';

export const SORT_MODIFY_CANCEL_SCREEN = 'sort_modify_cancel_screen';

export const LIST_OPTION_PAGINATION_FULL = [
    {
        title: "10",
        value: 10
    },
    {
        title: "25",
        value: 25
    },
    {
        title: "50",
        value: 50
    },
    {
        title: "100",
        value: 100
    },
    {
        title: "All",
        value: 150
    },
]

export const LIST_OPTION_PAGINATION = [
    {
        title: "10",
        value: 10
    },
    {
        title: "25",
        value: 25
    },
    {
        title: "50",
        value: 50
    },
    {
        title: "100",
        value: 100
    },
]

export const DEFAULT_TIME_MAP_VALUE = {
    "0": [],
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
}

export const ROLE_TEAM_LEAD = 'leader';

export const GET_DATA_ALL_ACCOUNT = '*';

export const ITEM_PER_PAGE_SMALL = 10;

export const PAGE_SIZE_GET_ALL_ORDER_LIST = 0;

export const DEFAULT_TIMESTAMP_GET_ALL = 0;

export const DEFAULT_ROW_HEIGHT = 35;


