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
import { KEY_LOCAL_STORAGE, NOTE_RISK, POEM_ID, ROLE } from './constants/general.constant';
import Footer from './components/Footer';
import { ACCOUNT_ID, EXPIRE_TIME } from './../src/constants/general.constant';

const App = () => {
  const [isLogin, setIsLogin] = useState(false)

  useEffect(() => {
    checkLoginPage();
  }, [isLogin])

  const checkLoginPage = () => {
    if (window.location.pathname === '/login') {
      setIsLogin(true);
      localStorage.removeItem(ACCOUNT_ID);
      localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
      localStorage.removeItem(EXPIRE_TIME);
      localStorage.removeItem(ROLE);
      localStorage.removeItem(POEM_ID);
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
        {!isLogin && _renderMainPage()}
        {isLogin && <Login />}
      </PersistGate>
    </Provider>
  );
}

export default App;
