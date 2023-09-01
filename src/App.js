import { useSelector } from "react-redux";

import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, StyledEngineProvider } from "@mui/material";

// routing
import Routes from "routes";

// defaultTheme
import themes from "themes";

// project imports
import NavigationScroll from "layout/NavigationScroll";

import { SocketProvider } from "./utils/context/SocketContext";
import { ProgressLoader } from "./utils/context/ProgressLoader";
import 'animate.css';

// ==============================|| APP ||============================== //
console.log('Production env checking : ', { env: process.env.NODE_ENV })
if (process.env.NODE_ENV !== 'development') {
  console.log = () => { };
  console.error = () => { };
  console.warn = () => { };
}

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <ProgressLoader>
          <SocketProvider>
          <CssBaseline />
          <NavigationScroll>
            <Routes />
          </NavigationScroll>
          </SocketProvider>
        </ProgressLoader>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
