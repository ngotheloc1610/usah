import {combineReducers} from 'redux';
import user from './UserReducer';
import auth from './authReducer';
import orders from './OrdersReducer';
import app from './AppReducer';

const rootReducer = combineReducers({
  user,
  auth,
  orders,
  app
});

export default rootReducer;
