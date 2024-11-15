import { createTheme } from "@mui/material/styles";

// assets
import colors from "assets/scss/_themes-vars.module.scss";

// project imports
import componentStyleOverrides from "./compStyleOverride";
import themePalette from "./palette";
import themeTypography from "./typography";

/**
 * Represent theme style and structure as per Material-UI
 */

export const theme = () => {
  const color = colors;

  const themeOption = {
    colors: color,
    heading: color.primaryLight,
    paper: color.darkPaper,
    backgroundDefault: color.darkBackground,
    background: color.darkBackground,
    darkTextPrimary: color.darkTextPrimary,
    darkTextSecondary: color.darkTextSecondary,
    textDark: color.grey700,
    menuSelected: color.darkTextPrimary,
    menuSelectedBack: color.primaryDark,
    divider: color.grey800,
  };
  const themeOptions = {
    direction: "ltr",
    palette: themePalette(themeOption),
    mixins: {
      toolbar: {
        minHeight: "48px",
        padding: "16px",
        "@media (min-width: 600px)": {
          minHeight: "48px",
        },
      },
    },
    typography: themeTypography(themeOption),
  };

  const themes = createTheme(themeOptions);
  themes.components = componentStyleOverrides(themeOption);

  return themes;
};

export default theme;
