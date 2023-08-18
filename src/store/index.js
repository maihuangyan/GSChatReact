import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducers";
import thunk from 'redux-thunk'

// ==============================|| REDUX - MAIN STORE ||============================== //

const store = configureStore({ reducer: reducer, middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  serializableCheck: false,
  thunk,
}) });

export { store };
