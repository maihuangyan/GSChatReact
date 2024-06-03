import MainLayout from "layout/MainLayout";
import MinimalLayout from "layout/MinimalLayout";
import { lazy, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { handleLogin, handleLogout } from "store/actions";

// project imports
import Loadable from "ui-component/Loadable";
import { messageService } from "utils/jwt/messageService";
import ForgotPassword from "views/forgot/ForgotPassword";
import ResetPassword from "views/reset-password/ResetPassword";
import useJwt from "utils/jwt/useJwt"
import { SocketContext } from "utils/context/SocketContext";

// login option 3 routing
const Login = Loadable(lazy(() => import("../views/login")));

const Register = Loadable(lazy(() => import("views/register")));
const Chat = Loadable(lazy(() => import("views/chat")));

const AppRoutes = () => {
  const auth = useSelector((state) => state.auth);
  const role = auth.userData?.role;
  const dispatch = useDispatch();

  const loadRoomData = useContext(SocketContext).loadRoomData;
  const loadOnlineList = useContext(SocketContext).loadOnlineList;
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      useJwt.refreshToken(token); 
    }

    messageService.getMessage().subscribe(message => {
      if (message.text === 'Logout') {
        dispatch(handleLogout())
      }
      else if (message.text === 'Refresh') {
        dispatch(handleLogin(message.data))
        loadRoomData()
        loadOnlineList()
      }
      else if (message.text === 'Login') {
        dispatch(handleLogin(message.data))
        loadRoomData()
        loadOnlineList()
      }
    });
  }, [])

  return (
    <Routes>
      <Route exact path="/" element={<MinimalLayout />}>
        <Route
          index
          element={
            auth.accessToken &&
              auth.accessToken !== "" &&
              role !== undefined ? (
              <Navigate
                to={"/chat"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          exact
          path="login"
          element={
            auth.accessToken &&
              auth.accessToken !== "" &&
              role !== undefined ? (
              <Navigate
                to={"/chat"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
      </Route>
      <Route
        path=""
        element={
          auth.accessToken && auth.accessToken !== "" && role !== undefined ? (
            <MainLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="chat" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password/:code" element={<ResetPassword />} />
      <Route path="register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
