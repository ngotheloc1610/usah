import {combineReducers} from 'redux';
import user from './UserReducer';
import auth from './authReducer';
import orders from './OrdersReducer';

const rootReducer = combineReducers({
  user,
  auth,
  orders
});

export default rootReducer;
