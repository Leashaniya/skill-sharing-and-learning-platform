import { Button, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { loginUser } from "../../Store/Auth/Action";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const SigninForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setLoading(true);
        const result = await dispatch(loginUser(values));
        
        if (result.payload?.status) {
          // Store the JWT token
          localStorage.setItem("jwt", result.payload.jwt);
          
          // Close the modal if it's open
          if (onClose) {
            onClose();
          }
          
          // Navigate to home section
          setTimeout(() => {
            navigate("/home");
          }, 100);
        } else {
          setError(result.payload?.message || "Invalid email or password");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Login failed. Please try again.");
        console.error("Login error:", err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sign in</h2>
        {onClose && (
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              className="w-full"
              name="email"
              label="Email"
              fullWidth
              variant="outlined"
              size="large"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="password"
              label="Password"
              fullWidth
              variant="outlined"
              size="large"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
            />
          </Grid>

          <Grid className="mt-5" item xs={12}>
            <Button
              type="submit"
              sx={{
                width: "100%",
                borderRadius: "29px",
                py: "15px",
                bgcolor: "#1d9bf0",
              }}
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default SigninForm;
