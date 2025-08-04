import React, {  useContext } from "react";

import logo from "@/assets/images/logo.png";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { orange } from "@mui/material/colors";
import TextField from "@mui/material/TextField";

import useJwt from "@/utils/jwt/useJwt";
import { useForm, Controller } from "react-hook-form";

import { LoaderContext } from "@/utils/context/ProgressLoader";

import CopyrightYear from "@/ui-component/copyrightYear"

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
  }
};

const ForgotPassword = (props) => {

  const { control, handleSubmit } = useForm({
    reValidateMode: "onBlur",
  });

  const showToast = useContext(LoaderContext).showToast

  const onSubmit = (data) => {
    useJwt
      .forgotPassword({ email: data.email })
      .then((res) => {
        if (res.data.ResponseCode === 0) {
          showToast("success", "Please check your email")
        }
        else {
          showToast("error", res.data.ResponseMessage)
        }
      })
      .catch((err) => {
        showToast("error", err.message)
      });
  };

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
                  Reset Password
                </Typography>
                <Typography
                  component="h1"
                  variant="h1"
                  color="white"
                  sx={{
                    textAlign: "left",
                    fontSize: 30,
                    fontWeight: 100,
                    marginBottom: 5,
                  }}
                >
                  Please enter the email of your account that you want to reset the password.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
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
                          autoComplete="email"
                          InputLabelProps={{ shrink: true }}
                          error={error !== undefined}
                          helperText={
                            error ? loginHelper.email[error.type] : ""
                          }
                        />
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
              <Grid container spacing={2}></Grid>
              <CircleButton type="submit">SUBMIT</CircleButton>
            </Box>
          </Box>
        </form>
      </Grid>
    </Grid>
  );
};

export default ForgotPassword;
