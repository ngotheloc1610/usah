import { IStyleBidsAsk, ISymbolMultiOrder } from '../../interfaces/order.interface';
import Types from '../types';

const loginSuccess = (payload: any) => ({
  type: Types.LOGIN_SUCCESS,
  payload,
});

const clearUser = () => ({
  type: Types.CLEAR_USER,
});

const chooseLayoutOrderBook = (payload: IStyleBidsAsk) => ({
  type: Types.LAYOUT_ORDER_BOOK,
  payload
})

const keepListOrder = (payload: ISymbolMultiOrder[]) => ({
  type: Types.LIST_ORDER_MULTI_ORDER,
  payload
})

export {loginSuccess, clearUser, chooseLayoutOrderBook, keepListOrder};
