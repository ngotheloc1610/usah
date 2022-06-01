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
import { KEY_LOCAL_STORAGE, MIN_ORDER_VALUE, NOTE_RISK, POEM_ID, ROLE } from './constants/general.constant';
import Footer from './components/Footer';
import { ACCOUNT_ID, EXPIRE_TIME } from './../src/constants/general.constant';
import ResetPassword from './pages/Authentication/reset-password';

const App = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  console.log(20, window.location.pathname)

  useEffect(() => {
    checkLoginPage();
  }, [isLogin, isResetPassword])

  const checkLoginPage = () => {
    const path = window.location.pathname;
    if (path.includes('/login')) {
      setIsLogin(true);
      setIsResetPassword(false);
      localStorage.removeItem(ACCOUNT_ID);
      localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
      localStorage.removeItem(EXPIRE_TIME);
      localStorage.removeItem(ROLE);
      localStorage.removeItem(POEM_ID);
      localStorage.removeItem(MIN_ORDER_VALUE);
      return;
    }
    if (path.includes('/reset-password')) {
      setIsLogin(false);
      setIsResetPassword(true);
      return;
    }
    ReduxPersist.storeConfig.storage.getItem(KEY_LOCAL_STORAGE.AUTHEN).then(resp => {
      if (resp) {
        setIsLogin(false);
      }
      else {
        setIsLogin(true);
      }
    });
  }

  const _renderMainPage = () => {
    return (
      <>
        <Header />
        <RouterDom />
        <div className="container note_risk fz-14 mb-1">
          Notes: 
          <br/>
          {NOTE_RISK}
        </div>
        <Footer />
      </>
    )
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {!isLogin && !isResetPassword && _renderMainPage()}
        {isLogin && <Login />}
        {isResetPassword && <ResetPassword />}
      </PersistGate>
    </Provider>
  );
}

export default App;
