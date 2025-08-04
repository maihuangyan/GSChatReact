import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import * as serviceWorker from './serviceWorker';

import App from "./App";

// style + assets
import "./assets/scss/style.scss";
import 'animate.css';

const container = document.getElementById("root");
const root = createRoot(container);

const persistor = persistStore(store, {}, function () {
  persistor.persist();
});
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>loading</div>} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  // </React.StrictMode>
);

serviceWorker.register();