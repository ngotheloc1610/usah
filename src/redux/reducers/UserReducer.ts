import Types from '../types';
import {AnyAction} from 'redux';

const initState = {
  create_date: '',
  id: 0,
  login: '',
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
    default:
      return state;
  }
};

export default UserReducers;
