import React, { lazy } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

// Layouts
import MainLayout from "@/layout/MainLayout";
import MinimalLayout from "@/layout/MinimalLayout";

// Components
import Loadable from "@/ui-component/Loadable";
import ForgotPassword from "@/views/forgot/ForgotPassword";
import ResetPassword from "@/views/reset-password/ResetPassword";

// Lazy-loaded views
const Login = Loadable(lazy(() => import("@/views/login")));
const Register = Loadable(lazy(() => import("@/views/register")));
const Chat = Loadable(lazy(() => import("@/views/chat")));
const Settings = Loadable(lazy(() => import("@/views/settings")));
const SearchUser = Loadable(lazy(() => import("@/views/searchUser")));
const Information = Loadable(lazy(() => import("@/views/Information")));
const HistoryMessage = Loadable(lazy(() => import("@/views/historyMessage")));

const AppRoutes = () => {
  const { refreshToken } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Minimal Layout Routes */}
      <Route path="/" element={<MinimalLayout />}>
        <Route
          index
          element={refreshToken ? <Navigate to="/chat" replace /> : <Login />}
        />
        <Route
          path="login"
          element={refreshToken ? <Navigate to="/chat" replace /> : <Login />}
        />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:code" element={<ResetPassword />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Main Layout Routes */}
      <Route
        path="/"
        element={refreshToken ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
        <Route path="searchUser" element={<SearchUser />} />
        <Route path="information" element={<Information />} />
        <Route path="historyMessage" element={<HistoryMessage />} />
      </Route>

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to={refreshToken ? "/chat" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;