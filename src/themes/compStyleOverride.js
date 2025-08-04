export default function componentStyleOverrides(theme) {
  const bgColor = theme.backgroundDefault;
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: "20px",
          "&.MuiButton-containedSecondary": {
            backgroundColor: theme.darkBackground,
            color: theme.darkTextPrimary,
            border: "solid 1px #585858",
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          "&.MuiIconButton-root": {
            ".MuiTypography-root": {
              color: theme.darkLevel1,
            },
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          background: theme.paper,
        },
        rounded: {
          borderRadius: `20px`,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          color: theme.textDark,
          padding: "24px",
        },
        title: {
          fontSize: "1.125rem",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: theme.darkTextPrimary,
          paddingTop: "10px",
          paddingBottom: "10px",
          "&.Mui-selected": {
            color: theme.darkTextSecondary,
            backgroundColor: "inherit",
            "&:hover": {
              backgroundColor: "inherit",
              color: theme.darkTextSecondary,
            },
          },
          "&:hover": {
            backgroundColor: "inherit",
            color: theme.textDark,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: theme.darkTextPrimary,
          minWidth: "36px",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: theme.textDark,
        },
        root: {
          "& .MuiTypography-body1": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: bgColor,
          borderRadius: "30px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.grey900,
            borderWidth: "1px !important",
          },
          "&:hover $notchedOutline": {
            borderColor: theme.textDark,
          },
          "&.MuiInputBase-multiline": {
            padding: 1,
          },
          "& .Mui-focused":{
            borderWidth:"1px"
          }
        },
        input: {
          fontWeight: 500,
          background: bgColor,
          padding: "15.5px 14px",
          borderRadius: "27px",
          "&.MuiInputBase-inputSizeSmall": {
            padding: "10px 14px",
            "&.MuiInputBase-inputAdornedStart": {
              paddingLeft: 0,
            },
          },
        },
        inputAdornedStart: {
          paddingLeft: 4,
        },
        notchedOutline: {
          borderRadius: "30px",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            color: theme.grey300,
          },
        },
        mark: {
          backgroundColor: theme.paper,
          width: "4px",
        },
        valueLabel: {
          color: theme.heading,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: theme.divider,
          opacity: 0.5,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          color: theme.primaryLight,
          background: theme.paper,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          "&.MuiChip-deletable .MuiChip-deleteIcon": {
            color: "inherit",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: theme.primaryDark,
          background: theme.grey700,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: theme.primaryLight,
          "&:hover": {
            color: theme.primaryMain,
          },
        },
      },
    },

    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-page": {
            border: "solid 1px #202020",
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: theme.primaryMain,
            color: theme.grey900,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          "& .MuiPaper-root": {
            borderRadius: "5px",
          },
        },
      },
    },
  };
}
