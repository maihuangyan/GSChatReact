export default function themePalette(theme) {
  return {
    mode: "dark",
    common: {
      black: theme.backgroundDefault,
      gold: theme.primaryMain,
      goldBar: theme.goldBar,
      silver: theme.silver,
      silverBar: theme.silverBar,
    },
    primary: {
      light: theme.primaryLight,
      main: theme.primaryMain,
      dark: theme.primaryDark,
      200: theme.primary200,
      800: theme.primary800,
    },
    secondary: {
      light: theme.secondaryLight,
      main: theme.secondaryMain,
      dark: theme.secondaryDark,
      200: theme.secondary200,
      800: theme.secondary800,
    },
    error: {
      light: theme.errorLight,
      main: theme.errorMain,
      dark: theme.errorDark,
    },
    orange: {
      light: theme.orangeLight,
      main: theme.orangeMain,
      dark: theme.orangeDark,
    },
    warning: {
      light: theme.warningLight,
      main: theme.warningMain,
      dark: theme.warningDark,
    },
    success: {
      light: theme.successLight,
      200: theme.success200,
      main: theme.successMain,
      dark: theme.successDark,
    },
    grey: {
      50: theme.grey50,
      100: theme.grey100,
      500: theme.darkTextSecondary,
      600: theme.heading,
      700: theme.darkTextPrimary,
      900: theme.textDark,
    },
    dark: {
      light: theme.darkTextPrimary,
      main: theme.darkLevel1,
      dark: theme.darkLevel2,
      800: theme.darkBackground,
      900: theme.darkPaper,
    },
    text: {
      primary: theme.darkTextPrimary,
      secondary: theme.darkTextSecondary,
      dark: theme.textDark,
      black: theme.darkTextBlack,
      hint: theme.grey100,
    },
    background: {
      paper: theme.paper,
      default: theme.backgroundDefault,
    },
  };
}
