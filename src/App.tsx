import './App.css';
import './i18n';
import { persistor } from './redux/store/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import { useDispatch, useSelector } from 'react-redux';
import RouterDom from './Router';
import Header from './components/Header';
import { useEffect, useState } from 'react';
import Login from './pages/Authentication/Login';
import ReduxPersist from './config/ReduxPersist';
import { KEY_LOCAL_STORAGE, KEY_SESSION_STORAGE, MAX_ORDER_VALUE, MAX_ORDER_VOLUME, MIN_ORDER_VALUE, NOTE_RISK, POEM_ID, ROLE, TEAM_CODE, TEAM_ID, TEAM_ROLE } from './constants/general.constant';
import Footer from './components/Footer';
import { ACCOUNT_ID, EXPIRE_TIME } from './../src/constants/general.constant';
import ResetPassword from './pages/Authentication/reset-password';
import ForgotPassword from './pages/Authentication/forgot-password';
import Blocked from './pages/Blocked';
import { convertNumber } from './helper/utils';
import { setTabBlock } from './redux/actions/auth';
import ResetTeamPassword from './pages/Authentication/reset-team-password';
import moment from 'moment';
import 'react-virtualized/styles.css';

import worker_script from './web-worker/worker';
const App = () => {
  const dispatch = useDispatch()
  // create a worker, worker work what func is exported in file './web-worker/worker' 
  // woker run scripts in an other thread
  const worker = new Worker(worker_script)
  const [isLogin, setIsLogin] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isShowIdleTimeOut, setIsShowIdleTimeOut] = useState(false);
  const [isResetTeamPassword, setIsResetTeamPassword] = useState(false);
  const isBlocked = useSelector((state: any) => state.auth.tabBlock);
  const idleEvents = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];

  useEffect(() => {
    const token = sessionStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN);
    const authen = localStorage.getItem(KEY_LOCAL_STORAGE.AUTHEN);
    const pageAvailable = convertNumber(localStorage.getItem('page_available'));
    const openPage = convertNumber(localStorage.getItem('open_page'));
    if (!token && !isForgotPassword && !isResetPassword && !isLogin && !isResetTeamPassword && authen) {
      sessionStorage.removeItem(KEY_SESSION_STORAGE.SESSION);
    }
    if ((openPage - pageAvailable) > 0) {
      dispatch(setTabBlock(false))
      checkLoginPage()
    }
  })

  useEffect(() => {
    // every login success send a message 'start"
    worker.postMessage('start')
  }, [])

  useEffect(() => {
    localStorage.open_page = moment().unix();
    window.addEventListener('storage', function (e) {
      if (e.key === "open_page") {
        localStorage.page_available = moment().unix();
        dispatch(setTabBlock(false))
      }
      if (e.key === "page_available") {
        dispatch(setTabBlock(true))
      }
    }, false);
  }, [])

  useEffect(() => {
    idleEvents.forEach(event => {
      window.addEventListener(event, () => {
        // every user action send a message "stop", after that send a message "start" to count idle time
        worker.postMessage('stop')
        worker.postMessage('start')
      });
    })
    return () => {
      idleEvents.forEach(event => {
        window.removeEventListener(event, () => {
          worker.postMessage('stop')
          worker.postMessage('start')
        });
      })
    };
  }, []);

  useEffect(() => {
    // worker get data from method postMessage 
    worker.onmessage = (e) => {
      if (!window.location.pathname.includes('/login') && window.globalThis.idleTimeOut < (e.data * 1000)) {
        setIsShowIdleTimeOut(true);
      }
    }
  }, [])

  useEffect(() => {
    checkLoginPage();
  }, [isLogin, isResetPassword, isResetTeamPassword])

  useEffect(() => {
    const session = sessionStorage.getItem(KEY_SESSION_STORAGE.SESSION);
    const pageAvailable = convertNumber(localStorage.getItem('page_available'));
    const openPage = convertNumber(localStorage.getItem('open_page'));
    if (!session && !isForgotPassword && !isResetPassword && !isResetTeamPassword && !isLogin && (openPage - pageAvailable < 0)) {
      dispatch(setTabBlock(true))
    }
  }, [isLogin])

  const checkLoginPage = () => {
    const path = window.location.pathname;
    if (path.includes('/login')) {
      setIsLogin(true);
      dispatch(setTabBlock(false))
      setIsResetPassword(false);
      setIsForgotPassword(false);
      setIsResetTeamPassword(false);
      sessionStorage.removeItem(ACCOUNT_ID);
      sessionStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
      localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
      sessionStorage.removeItem(TEAM_CODE);
      sessionStorage.removeItem(TEAM_ID);
      sessionStorage.removeItem(TEAM_ROLE);
      sessionStorage.removeItem(EXPIRE_TIME);
      sessionStorage.removeItem(ROLE);
      sessionStorage.removeItem(POEM_ID);
      localStorage.removeItem(MIN_ORDER_VALUE);
      localStorage.removeItem(MAX_ORDER_VALUE);
      localStorage.removeItem(MAX_ORDER_VOLUME);
      return;
    }
    if (path.includes('/reset-password') && !path.includes("/teams")) {
      setIsLogin(false);
      dispatch(setTabBlock(false))
      setIsResetPassword(true);
      setIsForgotPassword(false);
      setIsResetTeamPassword(false);
      return;
    }
    if (path.includes('/forgot-password') && !path.includes("/teams")) {
      setIsLogin(false);
      dispatch(setTabBlock(false))
      setIsResetPassword(false);
      setIsForgotPassword(true);
      setIsResetTeamPassword(false);
      return;
    }
    if (path.includes('/teams/reset-password')) {
      setIsLogin(false);
      dispatch(setTabBlock(false))
      setIsResetPassword(false);
      setIsForgotPassword(false);
      setIsResetTeamPassword(true);
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
          <br />
          {NOTE_RISK}
        </div>
        <Footer />
      </>
    )
  }

  const gotoLoginPage = () => {
    setIsShowIdleTimeOut(false);
    sessionStorage.removeItem(ACCOUNT_ID);
    sessionStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
    localStorage.removeItem(KEY_LOCAL_STORAGE.AUTHEN);
    sessionStorage.removeItem(TEAM_CODE);
    sessionStorage.removeItem(TEAM_ID);
    sessionStorage.removeItem(TEAM_ROLE);
    sessionStorage.removeItem(EXPIRE_TIME);
    sessionStorage.removeItem(ROLE);
    sessionStorage.removeItem(POEM_ID);
    localStorage.removeItem(MIN_ORDER_VALUE);
    localStorage.removeItem(MAX_ORDER_VALUE);
    localStorage.removeItem(MAX_ORDER_VOLUME);
    window.location.href = '/lp/login';
  }

  const renderIdleTimeOutModel = () => (
    <div className="popup-box" style={{ background: '#403d3dcf' }}>
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
      <PersistGate loading={null} persistor={persistor}>
        {!isLogin && !isResetPassword && !isForgotPassword && !isBlocked && !isResetTeamPassword && _renderMainPage()}
        {isLogin && <Login />}
        {isResetPassword && <ResetPassword />}
        {isForgotPassword && <ForgotPassword />}
        {!isLogin && isBlocked && !isResetTeamPassword && <Blocked />}
        {isResetTeamPassword && <ResetTeamPassword />}
      </PersistGate>
      {isShowIdleTimeOut && renderIdleTimeOutModel()}
    </>
  );
}

export default App;
