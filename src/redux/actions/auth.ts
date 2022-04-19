import Types from '../types';

const setLogin = (payload: any) => ({
  type: Types.LOGIN,
  payload,
});

const setSplash = (payload: any) => ({
  type: Types.SPLASH,
  payload,
});

const setSecretKey = (payload: string) => ({
  type: Types.SECRET_KEY,
  payload,
});

const setRememberKey = (payload: string) => ({
  type: Types.REMEMBER_KEY,
  payload,
})

export {setLogin, setSplash, setSecretKey, setRememberKey};
