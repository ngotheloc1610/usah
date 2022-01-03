import './App.css';
import './i18n';
import {store, persistor} from './redux/store/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import RouterDom from './Router';
import Header from './components/Header';
// import './components/Header/Header.css'

const App = () => {
  return (
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Header />
      <RouterDom/>
    </PersistGate>
  </Provider>
  );
}

export default App;
