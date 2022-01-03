import storage from 'redux-persist/lib/storage' 

const ReduxPersist = {
  active: true,
  reducerVersion: '0.5',
  storeConfig: {
    key: 'primary',
    storage: storage,
    whitelist: ['user'],
  },
};

export default ReduxPersist;
