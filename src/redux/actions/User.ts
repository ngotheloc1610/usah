import Types from '../types';

const loginSuccess = (payload: any) => ({
  type: Types.LOGIN_SUCCESS,
  payload,
});

const clearUser = () => ({
  type: Types.CLEAR_USER,
});

export {loginSuccess, clearUser};
