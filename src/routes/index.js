import MainLayout from "layout/MainLayout";
import MinimalLayout from "layout/MinimalLayout";
import { lazy } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

// project imports
import Loadable from "ui-component/Loadable";
import ForgotPassword from "views/forgot/ForgotPassword";
import ResetPassword from "views/reset-password/ResetPassword";

// login option 3 routing
const Login = Loadable(lazy(() => import("views/login")));

const Register = Loadable(lazy(() => import("views/register")));
const Chat = Loadable(lazy(() => import("views/chat")));
const Settings = Loadable(lazy(() => import("views/settings")));
const SearchUser = Loadable(lazy(() => import("views/searchUser")));
const Information = Loadable(lazy(() => import("views/Information")));

const AppRoutes = () => {
  const auth = useSelector(state => state.auth)

  return (
    <Routes>
      <Route exact path="/" element={<MinimalLayout />}>
        <Route index element={auth.refreshToken ? (<Navigate to={"/chat"} replace />) : (<Login />)} />
        <Route exact path="login" element={auth.refreshToken ? (<Navigate to={"/chat"} replace />) : (<Login />)} />
      </Route>
      <Route path="" element={auth.refreshToken ? (<MainLayout />) : (<Navigate to="/login" replace />)}>
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
        <Route path="searchUser" element={<SearchUser />} />
        <Route path="information" element={<Information />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password/:code" element={<ResetPassword />} />
      <Route path="register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
