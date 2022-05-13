import * as smpb from '../models/proto/system_model_pb';
import * as tdpb from '../models/proto/trading_model_pb';
const systemModel: any = smpb;
const tradingModel: any = tdpb;

export const MESSAGE_ERROR = new Map([
    [systemModel.MsgCode.MT_RET_ERROR, 'Internal Server Error'],
    [systemModel.MsgCode.MT_RET_ERR_PARAM, 'Invalid Format'],
    [systemModel.MsgCode.MT_RET_ERR_PERMISSIONS, 'Not authorized to access the resoures'],
    [systemModel.MsgCode.MT_RET_ERR_TIMEOUT, 'Request timed out'],

    [systemModel.MsgCode.MT_RET_ERR_NOTFOUND, 'Not Found'],
    [systemModel.MsgCode.MT_RET_AUTH_ACCOUNT_INVALID, 'Account invalid'],
    [systemModel.MsgCode.MT_RET_AUTH_ACCOUNT_DISABLED, 'Authen account disabled'],
    [systemModel.MsgCode.MT_RET_REQUEST_INVALID_VOLUME, 'Invalid Quantity'],

    [systemModel.MsgCode.MT_RET_ERR_NOT_ENOUGH_MONEY, 'Not enough money'],
    [systemModel.MsgCode.MT_RET_REQUEST_INVALID_FILL, 'Invalid Fill'],
    [systemModel.MsgCode.MT_RET_REQUEST_LIMIT_VOLUME, 'Request limit quantity'],
    [systemModel.MsgCode.MT_RET_REQUEST_INVALID_ORDER_TYPE, 'Invalid Order Type'],

    [systemModel.MsgCode.MT_RET_REQUEST_INVALID_LIMIT_PRICE, 'Request invalid limt price'],
    [systemModel.MsgCode.MT_RET_REQUEST_INVALID_TRIGGER_PRICE, 'Request invalid trigger price'],
    [systemModel.MsgCode.MT_RET_REQUEST_PROHIBITED_OPEN_ORDER, 'Request prohibited open order'],
    [systemModel.MsgCode.MT_RET_REQUEST_PROHIBITED_CLOSE_ORDER, 'Request prohibited close order'],

    [systemModel.MsgCode.MT_RET_MARKET_CLOSED, 'Market closed'],
    [systemModel.MsgCode.MT_RET_INVALID_TICK_SIZE, 'Invalid price'],
    [systemModel.MsgCode.MT_RET_INVALID_PRICE_RANGE, 'Out of price range'],
    [systemModel.MsgCode.MT_RET_INVALID_MIN_LOT, 'Invalid min lot'],

    [systemModel.MsgCode.MT_RET_INVALID_LOT_SIZE, 'Invalid lot size'],
    [systemModel.MsgCode.MT_RET_NEGATIVE_QTY, 'Negative qty'],
    [systemModel.MsgCode.MT_RET_EXCEED_MAX_ORDER_VOLUME, 'Quantity is exceed max order quantity'],
    [systemModel.MsgCode.MT_RET_NOT_ENOUGH_MIN_ORDER_VALUE, 'The order is less than USD 20,000. Kindly revise the number of shares'],
    [systemModel.MsgCode.MT_RET_INVALID_HOLIDAY_SESSION, 'Market is closed during holiday'],
    [systemModel.MsgCode.MT_RET_TOKEN_EXPIRED, 'Token expired'],
  ]);
  
  export const MESSAGE_ERROR_MIN_ORDER_VALUE_HISTORY = 'The order is less than USD 20,000';