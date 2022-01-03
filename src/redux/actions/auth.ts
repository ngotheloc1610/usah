import Types from '../types';

const setLogin = (payload: any) => ({
  type: Types.LOGIN,
  payload,
});

const setSplash = (payload: any) => ({
  type: Types.SPLASH,
  payload,
});

export {setLogin, setSplash};
