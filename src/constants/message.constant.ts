import * as smpb from '../models/proto/system_model_pb';
const systemModel: any = smpb;

export const MESSAGE_ERROR = [
     {
         code: systemModel.MsgCode.MT_RET_ERROR,
         value: 'Internal Server Error',
     },
     {
         code: systemModel.MsgCode.MT_RET_ERR_PARAMS,
         value: 'Invalid Format',
     },
     {
         code: systemModel.MsgCode.MT_RET_ERR_PERMISSIONS,
         value: 'Not authorized to access the resoures',
     },
     {
         code: systemModel.MsgCode.MT_RET_ERR_TIMEOUT,
         value: 'Request timed out',
     },
     {
         code: systemModel.MsgCode.MT_RET_ERR_NOTFOUND,
         value: 'Not Found',
     },
     {
         code: systemModel.MsgCode.MT_RET_AUTH_ACCOUNT_INVALID,
         value: 'Account invalid',
     },
     {
         code: systemModel.MsgCode.MT_RET_AUTH_ACCOUNT_DISABLED,
         value: 'Authen account disabled',
     },
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_INVALID_VOLUME,
         value: 'Invalid Quantity',
     },
     {
         code: systemModel.MsgCode.MT_RET_ERR_NOT_ENOUGH_MONEY,
         value: 'Not enough money',
     },
 
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_INVALID_FILL,
         value: 'Invalid Fill',
     },
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_LIMIT_VOLUME,
         value: 'Request limit quantity',
     },
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_INVALID_ORDER_TYPE,
         value: 'Invalid Order Type',
     },
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_INVALID_LIMIT_PRICE,
         value: 'Request invalid limt price',
     },
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_INVALID_TRIGGER_PRICE,
         value: 'Request invalid trigger price',
     },
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_PROHIBITED_OPEN_ORDER,
         value: 'Request prohibited open order',
     },
     {
         code: systemModel.MsgCode.MT_RET_REQUEST_PROHIBITED_CLOSE_ORDER,
         value: 'Request prohibited close order',
     },
     {
         code: systemModel.MsgCode.MT_RET_MARKET_CLOSED,
         value: 'Merket closed',
     },
     {
         code: systemModel.MsgCode.MT_RET_INVALID_TICK_SIZE,
         value: 'Invalid Tick Sixe',
     },
     {
         code: systemModel.MsgCode.MT_RET_INVALID_PRICE_RANGE,
         value: 'Invalid price range',
     },
     {
         code: systemModel.MsgCode.MT_RET_INVALID_MIN_LOT,
         value: 'Invalid min lot',
     },
     {
         code: systemModel.MsgCode.MT_RET_INVALID_LOT_SIZE,
         value: 'Invalid lot sixe',
     },
     {
         code: systemModel.MsgCode.MT_RET_NEGATIVE_QTY,
         value: 'Negative qty',
     },
     {
         code: systemModel.MsgCode.MT_RET_EXCEED_MAX_ORDER_VOLUME,
         value: 'Quantity is exceed max order quantity',
     },
     {
         code: systemModel.MsgCode.MT_RET_NOT_ENOUGH_MIN_ORDER_VALUE,
         value: 'The order is less than USD 20,000. Kindly revise the number of shares',
     },
     {
         code: systemModel.MsgCode.MT_RET_INVALID_HOLIDAY_SESSION,
         value: 'Market is closed during holiday',
     },
     {
         code: systemModel.MsgCode.MT_RET_TOKEN_EXPIRED,
         value: 'Token expired',
     },
 ]