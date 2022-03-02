import './App.css';
import './i18n';
import { store, persistor } from './redux/store/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import RouterDom from './Router';
import Header from './components/Header';
import { useEffect, useState } from 'react';
import Login from './pages/Authentication/Login';
import ReduxPersist from './config/ReduxPersist';
import { KEY_LOCAL_STORAGE } from './constants/general.constant';
import Footer from './components/Footer';
import { ACCOUNT_ID, EXPIRE_TIME } from './../src/constants/general.constant';

const App = () => {
  const [isLogin, setIsLogin] = useState(false)

  useEffect(() => {
    checkLoginPage();
  }, [isLogin])

  const checkLoginPage = () => {
    ReduxPersist.storeConfig.storage.getItem(KEY_LOCAL_STORAGE.AUTHEN).then(resp => {
      if (resp) {
        setIsLogin(false);
      }
      else {
        setIsLogin(true);
      }
    });
  }

  const _renderMainPage = () => (
    <>
      <Header />
      <RouterDom />
      <Footer />
    </>
  )

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {!isLogin && _renderMainPage()}
        {isLogin && <Login />}
      </PersistGate>
    </Provider>
  );
}

export default App;
