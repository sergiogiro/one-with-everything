
  // frontend/src/index.js

  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import 'bootstrap/dist/css/bootstrap.min.css';       // add this
  import './index.css';
  import App from './App';
  import { Provider } from 'react-redux';
  import { configureStore } from '@reduxjs/toolkit';
  import * as serviceWorker from './serviceWorker';
  import { todoSlice } from './features/todo/todoSlice';

  let store = configureStore({
    reducer: {
      todo: todoSlice.reducer
    }
  });

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: http://bit.ly/CRA-PWA
  serviceWorker.unregister();
