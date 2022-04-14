import Types from '../types';
import {AnyAction} from 'redux';
import { DEFAULT_STYLE_LAYOUT } from '../../mocks';

const initState = {
  create_date: '',
  id: 0,
  login: '',
  layoutOrderBook: DEFAULT_STYLE_LAYOUT
};

const UserReducers = (state = initState, action: AnyAction) => {
  const {type, payload} = action;
  switch (type) {
    case Types.LOGIN_SUCCESS:
      return {
        ...state,
        user: payload,
      };
    case Types.CLEAR_USER:
      return initState;
    case Types.LAYOUT_ORDER_BOOK:
      return {
        ...state,
        layoutOrderBook: payload
      }

    default:
      return state;
  }
};

export default UserReducers;
