import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
// routing
import Routes from "routes";

// defaultTheme
import themes from "themes";

// project imports
import { SocketProvider } from "./utils/context/SocketContext";
import { ProgressLoader } from "./utils/context/ProgressLoader";
import 'animate.css';
import { useEffect } from "react";
import OneSignal from 'react-onesignal';

// ==============================|| APP ||============================== //
console.log('Production env checking : ', { env: process.env.NODE_ENV })
if (process.env.NODE_ENV !== 'development') {
  console.log = () => { };
  console.error = () => { };
  console.warn = () => { };
}

let initedOneSignal = false
const App = () => {
  useEffect(() => {
    if (!initedOneSignal) {
      OneSignal.init({ appId: `${process.env.REACT_APP_ONE_SIGNAL_APP_ID}`, allowLocalhostAsSecureOrigin: true }).then(async () => {
        if (OneSignal.Slidedown) {
          OneSignal.Slidedown.promptPush();
        }
        if (OneSignal.Notifications) {
          OneSignal.Notifications.requestPermission();
        }
      })
      initedOneSignal = true;
    }
  }, [])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes()}>
        <ProgressLoader>
          <SocketProvider>
            <CssBaseline />
            <Routes />
          </SocketProvider>
        </ProgressLoader>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
