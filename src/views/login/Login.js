import { useState, useContext } from "react";

import logo from "../../assets/images/logo.png";
import {
  CssBaseline,
  Typography,
  Box,
  Grid,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  IconButton,
  Input,
  Link,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText,
} from "@mui/material"

import { styled } from "@mui/material/styles";
import { orange } from "@mui/material/colors";
import OneSignal from 'react-onesignal';

//Icons
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
  RadioButtonUnchecked,
  CheckCircle,
} from "@mui/icons-material";

import { messageService } from "utils/jwt/messageService";
import useJwt from "utils/jwt/useJwt";
import { useForm, Controller } from "react-hook-form";
import { LoaderContext } from "utils/context/ProgressLoader";
import CopyrightYear from "ui-component/copyrightYear"

const CircleButton = styled(Button)(({ theme }) => ({
  borderRadius: "50px",
  width: "100px",
  height: "100px",
  fontWeight: "bold",
  margin: "20px",
  color: theme.palette.getContrastText(orange[500]),
  backgroundColor: "#F8F8F8",
  "&:hover": {
    backgroundColor: "#FBC34A",
  },
}));

const loginHelper = {
  email: {
    required: "Email is Required.",
    pattern: "Invaild Email Address",
  },
  password: {
    required: "Password is Required.",
    minLength: "Password must be at least 8 characters long.",
  },
};
const Login = (props) => {
  const { control, handleSubmit } = useForm({
    reValidateMode: "onBlur",
  });

  const [showPassword, setShowPassword] = useState(false);
  const showToast = useContext(LoaderContext).showToast

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const onSubmit = (data) => {
    useJwt
      .login({ email: data.email, password: data.password })
      .then(async (res) => {
        if (res.data.ResponseCode === 0) {
          const userData = res.data.ResponseResult;
          
          if (OneSignal.Notifications) {
            const isSupported = OneSignal.Notifications.isPushSupported();

            if (isSupported) {
              let permission = await OneSignal.Notifications.permission;
              if (permission && OneSignal.User && OneSignal.User.PushSubscription) {
                const params = {
                  one_signal_id: OneSignal.User.PushSubscription.id,
                  push_token: OneSignal.User.PushSubscription.token,
                  device_id: OneSignal.User.PushSubscription.device_id,
                  device_type: 0
                }
                console.log(params);
                useJwt
                  .postDeviceInfo(params)
                  .then(res => {
                    afterLogin(userData)
                  })
                  .catch((err) => {
                    afterLogin(userData)
                    showToast("error", err.message)
                  });
                return;
              }
            }
          }
          
          afterLogin(userData)
        }
        else {
          showToast("error", res.data.ResponseMessage)
        }
      })
      .catch((err) => {
        showToast("error", err.message)
      });
  };

  const afterLogin = (userData) => {
    messageService.sendMessage('Login', userData);
    // socket.emit("login", { token: userData.access_token });
  }

  // function eventListener(event) {
  //   console.log(`${event}`);
  // }
  return (
    <Grid
      container
      component="main"
      sx={{
        height: "100vh",
        background: "black",
        overflow: { xs: "auto", sm: "hidden" },
      }}
    >
      <CssBaseline />
      <Grid
        item
        xs={12}
        sm={5}
        md={6}
        sx={{
          position: "relative",
          borderRight: { md: "solid 1px #202020" },
          height: { xs: "70vh", sm: "100vh" },
        }}
      >
        <Box
          sx={{
            width: "50%",
            height: "100%",
            borderRight: "1px solid #202020",
            position: "absolute",
            left: 0,
          }}
        ></Box>
        <Box
          sx={{
            width: "100%",
            height: "50%",
            borderBottom: "1px solid #202020",
            position: "absolute",
            top: 0,
          }}
        ></Box>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            border: "1px solid #202020",
            position: "absolute",
            top: "-50%",
            left: "-50%",
            transform: "rotate(-45deg)",
            transformOrigin: "bottom right",
          }}
        ></Box>
        <Typography
          component="h1"
          variant="h1"
          color="white"
          sx={{
            p: 2,
            position: "absolute",
            width: "100%",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Golden Suisse<sup style={{ fontSize: 14 }}>&reg;</sup>
        </Typography>
        <Box
          component="img"
          sx={{
            position: { xs: "relative", sm: "absolute" },
            maxHeight: 280,
            maxWidth: 280,
            left: "calc(50% - 140px)",
            top: "calc(50% - 140px)",
          }}
          alt="The house from the offer."
          src={logo}
        />
        <Typography
          component="p"
          variant="p"
          color="text.disabled"
          sx={{
            fontSize: 12,
            p: 2,
            position: "absolute",
            width: "100%",
            bottom: 0,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <CopyrightYear />
        </Typography>
      </Grid>
      <Grid item xs={12} sm={7} md={6} elevation={6} sx={{ p: 3 }}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ height: "100%" }}
          noValidate
        >
          <Box
            sx={{
              borderRadius: 5,
              background: "#101010",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: { sm: "50%", xs: "inherit" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div />
              <Box sx={{ px: 3 }}>
                <Typography
                  component="h1"
                  variant="h1"
                  color="white"
                  sx={{
                    textAlign: "left",
                    fontSize: 70,
                    fontWeight: 100,
                    marginBottom: 5,
                  }}
                >
                  Login
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      control={control}
                      name="email"
                      defaultValue=""
                      rules={{
                        required: true,
                        pattern:
                          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          sx={{
                            "& .MuiFormLabel-root": {
                              color: "white",
                            },
                            "& .MuiInputBase-root": {
                              color: "white",
                              height: 50,
                              "& input": {
                                textAlign: "left",
                              },
                            },
                          }}
                          variant="standard"
                          type="email"
                          label="Email"
                          placeholder="Email"
                          InputLabelProps={{ shrink: true }}
                          error={error !== undefined}
                          helperText={
                            error ? loginHelper.email[error.type] : ""
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      control={control}
                      name="password"
                      defaultValue=""
                      rules={{
                        required: true,
                        minLength: 6,
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl
                          variant="standard"
                          sx={{ width: "100%" }}
                          {...field}
                        >
                          <InputLabel
                            htmlFor="standard-adornment-password"
                            shrink={true}
                            sx={{ color: "white" }}
                            error={error !== undefined}
                          >
                            Password
                          </InputLabel>
                          <Input
                            id="standard-adornment-password"
                            placeholder="********"
                            sx={{ height: 50, color: "white" }}
                            type={showPassword ? "text" : "password"}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                >
                                  {showPassword ? (
                                    <VisibilityOffOutlined fontSize="small" />
                                  ) : (
                                    <VisibilityOutlined fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            }
                            error={error !== undefined}
                          />
                          {error && (
                            <FormHelperText error>
                              {loginHelper.password[error.type]}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                height: { sm: "50%", xs: "inherit" },
                display: "flex",
                pt: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    label="Remember me"
                    sx={{ px: 3, color: "white" }}
                    control={
                      <Checkbox
                        color="warning"
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<CheckCircle />}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ mt: { xs: 0, sm: 1 } }}>
                  <Link
                    href="forgot-password"
                    underline="none"
                    color="white"
                    sx={{
                      px: { xs: 3, sm: 0 },
                      "&:hover": { color: "#FBC34A" },
                    }}
                  >
                    Forgot?
                  </Link>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "end" }}>
                <CircleButton type="submit">SIGN IN</CircleButton>
              </Grid>
            </Box>
          </Box>
        </form>
      </Grid>
    </Grid>
  );
};

export default Login;
