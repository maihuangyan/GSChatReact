import { createTheme } from "@mui/material/styles";

// project imports
import componentStyleOverrides from "./compStyleOverride";
import themePalette from "./palette";
import themeTypography from "./typography";

/**
 * Represent theme style and structure as per Material-UI
 */

export const theme = () => {

  const themeOption = {
    heading: "#ffffff",
    paper: "#101010",
    backgroundDefault: "#000000",
    textDark: "#616161",
    menuSelected: "#ffffff",
    menuSelectedBack: "#d4a234",
    divider: "585858",
    darkLevel1: "#404040",
    darkLevel2: "#202020",
    grey50: '#fafafa',
    grey100: '#f5f5f5',
    grey200: '#eeeeee',
    grey300: "#e0e0e0",
    grey500: "#9e9e9e",
    grey600: "#757575",
    grey700: "#616161",
    grey800: "#585858",
    grey900: "#212121",
    gold: "#FBC34A",
    goldBar: "#997017",
    silver: "#A0A0A0",
    silverBar: "#585858",
    darkTextTitle: "#d7dcec",
    darkTextPrimary: "#ffffff",
    darkTextSecondary: "#FBC34A",
    darkTextBlack: "#101010",
    darkBackground: "#d4a234",
    darkPaper: "#101010",
    primaryLight: "#ffffff",
    primaryMain: "#FBC34A",
    primaryDark: "#d4a234",
    primary200: "#90caf9",
    primary800: "#1565c0",
    secondaryLight: "#ede7f6",
    secondaryMain: "#673ab7",
    secondaryDark: "#5e35b1",
    secondary200: "#b39ddb",
    secondary800: "#4527a0",
    successLight: "#b9f6ca",
    success200: "#69f0ae",
    successMain: "#00e676",
    successDark: "#00c853",
    errorLight: "#ef9a9a",
    errorMain: "#f44336",
    errorDark: "#c62828",
    orangeLight: "#fbe9e7",
    orangeMain: "#ffab91",
    orangeDark: "#d84315",
    warningLight: "#fff8e1",
    warningMain: "#ffe57f",
    warningDark: "#ffc107",
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
