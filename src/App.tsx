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
import { KEY_LOCAL_STORAGE, KEY_SESSION_STORAGE, MAX_ORDER_VOLUME, MIN_ORDER_VALUE, NOTE_RISK, POEM_ID, ROLE } from './constants/general.constant';
import Footer from './components/Footer';
import { ACCOUNT_ID, EXPIRE_TIME } from './../src/constants/general.constant';
import ResetPassword from './pages/Authentication/reset-password';
import ForgotPassword from './pages/Authentication/forgot-password';
import Blocked from './pages/Blocked';

const App = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [isShowIdleTimeOut, setIsShowIdleTimeOut] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const idleEvents = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];

  useEffect(() => {
    const token = localStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN);
    if (!token && !isForgotPassword && !isResetPassword && !isLogin) {
      setIsBlocked(true);
      sessionStorage.removeItem(KEY_SESSION_STORAGE.SESSION);
    }
  })

   // Increment the checking time counter every 5 seconds.
   useEffect(() => {
    const interval = setInterval(() => {
      setIdleTime(prev => prev + 5)
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Set the idle timer to 0 if catch event.
  useEffect(() => {
    idleEvents.forEach(event => {
      window.addEventListener(event, () => setIdleTime(0));
    })
    return () => {
      idleEvents.forEach(event => {
        window.removeEventListener(event, () => setIdleTime(0));
      })
    };
  }, []);

  useEffect(() => {
    if (!window.location.pathname.includes('/login') && window.globalThis.idleTimeOut < (idleTime * 1000)) {
      setIsShowIdleTimeOut(true);
    }
  }, [idleTime])

  useEffect(() => {
    checkLoginPage();
  }, [isLogin, isResetPassword])

  useEffect(() => {
    const session = sessionStorage.getItem(KEY_SESSION_STORAGE.SESSION);
    if (!session && !isForgotPassword && !isForgotPassword && !isLogin) {
      setIsBlocked(true);
      localStorage.removeItem(ACCOUNT_ID);
      localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
      localStorage.removeItem(EXPIRE_TIME);
      localStorage.removeItem(ROLE);
      localStorage.removeItem(POEM_ID);
      localStorage.removeItem(MIN_ORDER_VALUE);
      localStorage.removeItem(MAX_ORDER_VOLUME);
    }
  }, [isLogin])

  const checkLoginPage = () => {
    const path = window.location.pathname;
    if (path.includes('/login')) {
      setIsLogin(true);
      setIsBlocked(false);
      setIsResetPassword(false);
      setIsForgotPassword(false);
      localStorage.removeItem(ACCOUNT_ID);
      localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
      localStorage.removeItem(EXPIRE_TIME);
      localStorage.removeItem(ROLE);
      localStorage.removeItem(POEM_ID);
      localStorage.removeItem(MIN_ORDER_VALUE);
      localStorage.removeItem(MAX_ORDER_VOLUME);
      return;
    }
    if (path.includes('/reset-password')) {
      setIsLogin(false);
      setIsBlocked(false);
      setIsResetPassword(true);
      setIsForgotPassword(false);
      return;
    }
    if (path.includes('/forgot-password')) {
      setIsLogin(false);
      setIsBlocked(false);
      setIsResetPassword(false);
      setIsForgotPassword(true);
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

 const gotoLoginPage = () => {
  setIsShowIdleTimeOut(false);
  localStorage.removeItem(ACCOUNT_ID);
  localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
  localStorage.removeItem(EXPIRE_TIME);
  localStorage.removeItem(ROLE);
  localStorage.removeItem(POEM_ID);
  localStorage.removeItem(MIN_ORDER_VALUE);
  localStorage.removeItem(MAX_ORDER_VOLUME);
  window.location.href = '/lp/login';
 }

  const renderIdleTimeOutModel = () => (
    <div className="popup-box" style={{background: '#403d3dcf'}}>
            <div className='content session-timeout-model'>
                <h4 className='text-danger'>Session Expired</h4>
                <br />
                <div>Your session ended because there was no activity.</div>
                <div>Please login again.</div>
                <br />
                <div className='text-center'>
                  <button className='btn btn-primary' onClick={gotoLoginPage}>Return Login Page</button>
                </div>
            </div>
        </div>
  )

  return (
    <>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {!isLogin && !isResetPassword && !isForgotPassword && !isBlocked && _renderMainPage()}
        {isLogin && <Login />}
        {isResetPassword && <ResetPassword />}
        {isForgotPassword && <ForgotPassword />}
        {isBlocked && <Blocked />}
      </PersistGate>
    </Provider>
    {isShowIdleTimeOut && renderIdleTimeOutModel()}
    </>
  );
}

export default App;
