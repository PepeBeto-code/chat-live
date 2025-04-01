'use client'

import SideNav from '@/components/SideNav';
import React from 'react';
import { Provider } from 'react-redux';
import { AuthProvider } from '../../context/AuthContext';
import { persistor, store } from '../../redux/store';
import {PersistGate} from 'redux-persist/lib/integration/react';
import LoadingOverlay from "@/components/LoadingOverlay"

const DashboardLayout = ({ children }) => {
  return (
    <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                <AuthProvider >
    <div className="flex fixed w-screen">

            <SideNav />

      <div className="__body h-screen overflow-auto w-100">
        {children}
      </div>
    </div>
    <LoadingOverlay/>

    </AuthProvider >

    </PersistGate>
    </Provider>
  );
};

export default DashboardLayout;