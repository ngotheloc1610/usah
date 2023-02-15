import { formatCurrency } from '../helper/utils';
import * as smpb from '../models/proto/system_model_pb';
import { MIN_ORDER_VALUE } from './general.constant';
const systemModel: any = smpb;

export const MESSAGE_ERROR = new Map([
    [systemModel.MsgCode.MT_RET_OK, 'Success'],
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
    [systemModel.MsgCode.MT_RET_FORWARD_EXT_SYSTEM, 'Orders forwarded to external trading system'],

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
    [systemModel.MsgCode.MT_RET_NOT_ENOUGH_MIN_ORDER_VALUE, `The order is less than USD ${formatCurrency(localStorage.getItem(MIN_ORDER_VALUE) || '0')}. Kindly revise the number of shares`],
    [systemModel.MsgCode.MT_RET_INVALID_HOLIDAY_SESSION, 'Market is closed during holiday'],
    [systemModel.MsgCode.MT_RET_TOKEN_EXPIRED, 'Token expired'],
    [systemModel.MsgCode.MT_RET_EXCEED_MAX_ORDER_VALUE, 'Gross value is exceed max order value'],
    [systemModel.MsgCode.MT_RET_UNKNOWN_ORDER_ID, 'Insufficient liquidity for this trade'],
  ]);
  
  export const MESSAGE_ERROR_MIN_ORDER_VALUE_HISTORY = `The order is less than USD ${formatCurrency(localStorage.getItem(MIN_ORDER_VALUE) || '0')}`;

  export const INSUFFICIENT_QUANTITY_FOR_THIS_TRADE = 'INSUFFICIENT QUANTITY FOR THIS TRADE';

  export const MESSAGE_ERROR_API = {
    ERROR_SUSPEND_ACCOUNT: "Account suspended"
  }

  export const INVALID_VOLUME= 'Invalid volume';
  export const INVALID_PRICE= 'Invalid price';

  export const HANDLE_NEW_ORDER_REQUEST = 'Handle new order request';
  export const HANDLE_MODIFY_REQUEST = 'Handle modify request';
  export const CANCEL_SUCCESSFULLY = 'Cancel order successfully'