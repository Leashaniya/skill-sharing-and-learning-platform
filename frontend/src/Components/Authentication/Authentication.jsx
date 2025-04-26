import { Button, Grid, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import AuthModel from "./AuthModel";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogleAction } from "../../Store/Auth/Action";
import AuthImage from "../../Assests/auth-background.jpg";

const Authentication = () => {
  const [authModelOpen, setAuthModelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useSelector((store) => store);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAuthModelClose = () => {
    setAuthModelOpen(false);
    navigate("/");
  };

  const handleAuthModelOpen = (path) => {
    setAuthModelOpen(true);
    navigate(path);
  };

  useEffect(() => {
    if (location.pathname === "/signin" || location.pathname === "/signup") {
      setAuthModelOpen(true);
    }
  }, [location.pathname]);

  const loginWithGoole = async (response) => {
    try {
      setIsLoading(true);
      const result = await dispatch(loginWithGoogleAction(response.credential));
      
      if (result.payload?.status) {
        // Close auth modal if open
        if (authModelOpen) {
          setAuthModelOpen(false);
        }
        
        // Use React Router's navigate instead of window.location
        navigate("/home");
      }
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="">
      {" "}
      <Grid className="overflow-y-hidden" container>
        <Grid className="hidden lg:block" item lg={7}>
          <img
            className="w-full h-screen"
            src={AuthImage}
            alt=""
          />

        </Grid>
        <Grid className="px-10 items-center pt-20" item lg={5} xs={12}>

          <h1 className="font-bold text-7xl">Happening now</h1>

          <h1 className="font-bold text-3xl py-16">Join Skill Sphere Today</h1>

          <div className="w-[60%]">
            <div className="w-full">
              {/* <button 
            className="w-full flex justify-center items-center border border-gray-400 py-2 px-7 rounded-full bg-white shadow-md text-gray-600">
              <img
                src="https://www.google.com/images/hpp/ic_wahlberg_product_core_48.png8.png"
                alt="Google Logo"
                className="h-6 w-6 mr-2"
              />
              Sign Up with Google
            </button> */}
              <GoogleLogin
                width={330}
                onSuccess={loginWithGoole}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
              <p className="py-5 text-center">OR</p>
              <Button
                onClick={() => handleAuthModelOpen("/signup")}
                sx={{
                  width: "100%",
                  borderRadius: "29px",
                  py: "7px",
                  bgcolor: "#1d9bf0",
                }}
                variant="contained"
                size="large"
              >
                Create Account
              </Button>
              <p className="text-sm mt-2">
                By signing up, you agree to the Terms of Service and Privacy
                Policy, including Cookie Use.
              </p>
            </div>
            <div className="mt-10">
              <h1 className="font-bold text-xl mb-5">Already Have Account?</h1>
              <Button
                onClick={() => handleAuthModelOpen("/signin")}
                sx={{
                  width: "100%",
                  borderRadius: "29px",
                  py: "7px",
                }}
                variant="outlined"
                size="large"
              >
                Signin
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
      <AuthModel open={authModelOpen} handleClose={handleAuthModelClose} />
    </div>
  );
};

export default Authentication;
