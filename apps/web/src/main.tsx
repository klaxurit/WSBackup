import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { AppKitProvider } from './config/wagmi';
import './styles/main.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppKitProvider>
        <App />
      </AppKitProvider>
    </Provider>
  </React.StrictMode>,
);
