// frontend/src/App.js

import React from "react";
import TodoContainer from "./components/TodoContainer";
import { store } from './Redux';
import { Provider } from "react-redux";


function App(props: {}) {
  return (
    <main className="content">
      <h1 className="text-white text-uppercase text-center my-4">Todo app</h1>
      <div className="row ">
        <Provider store={store}>
          <TodoContainer />
        </Provider>
      </div>
    </main>
  );
}
export default App;
