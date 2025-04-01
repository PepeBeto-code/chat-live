"use client";
import React from "react";
import Login from "./Login";
import { Provider } from "react-redux";
import { store, persistor } from "../../redux/store";
import { PersistGate } from "redux-persist/lib/integration/react";

function page() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Login />
      </PersistGate>
    </Provider>
  );
}

export default page;
