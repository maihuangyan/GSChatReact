import React from "react";
import { Outlet } from "react-router-dom";

// material-ui
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
} from "@mui/material";

// styles
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    ...theme.typography.mainContent,
    ...(!open && {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      width: "100%",
    }),
    ...(open && {
      marginLeft: 0,
      marginTop: 0,
      // margin: "0 8%",
      minHeight:"100vh",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      [theme.breakpoints.up("md")]: {
        width: `calc(100% - 200px)`,
      },
      [theme.breakpoints.down("md")]: {
        width: `100%`,
      },
    }),
  })
);

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex" }}>
      {/* main content */}
      <Main theme={theme}>
        {/* breadcrumb */}
        <Outlet />
      </Main>
    </Box>
  );
};

export default MainLayout;
