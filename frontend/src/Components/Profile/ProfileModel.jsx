import {
  Avatar,
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import { uploadToCloudinary } from "../../Utils/UploadToCloudinary";
import BackdropComponent from "../Backdrop/Backdrop";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../../Store/Auth/Action";
import "./ProfileModel.css"

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  //   height: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: 3,
  outline: "none",
  overflow: "scroll-y",
};

const ProfileModel = ({ handleClose,open }) => {
    const [uploading,setUploading]=useState(false);
    const dispatch=useDispatch();
    const {auth}=useSelector(store=>store);

  const handleSubmit = (values) => {
    dispatch(updateUserProfile(values))
    console.log(values);
    handleClose()
  };
  const formik = useFormik({
    initialValues: {
      fullName: "",
      website: "",
      location: "",
      bio: "",
      backgroundImage: "",
      image: "",
      education: "",
      skills: "",
      experience: ""
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    formik.setValues({
      fullName: auth.user.fullName || "",
      website: auth.user.website || "",
      location: auth.user.location || "",
      bio: auth.user.bio || "",
      backgroundImage: auth.user.backgroundImage || "",
      image: auth.user.image || "",
      education: auth.user.education || "",
      skills: auth.user.skills || "",
      experience: auth.user.experience || ""
    });
  }, [auth.user]);

  const handleImageChange=async(event)=>{
    setUploading(true)
    const {name}=event.target;
    const file = event.target.files[0];
    const url=await uploadToCloudinary(file,"image");
    formik.setFieldValue(name,url);
    setUploading(false);

  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IconButton onClick={handleClose} aria-label="delete">
                  <CloseIcon />
                </IconButton>
                <p>Edit Profile</p>
              </div>

              <Button type="submit">Save</Button>
            </div>

            <div className="customeScrollbar overflow-y-scroll  overflow-x-hidden h-[80vh]">
              <div className="">
                <div className="w-full">
                  <div className="relative ">
                    <img
                      src={
                        formik.values.backgroundImage ||
                        "https://cdn.pixabay.com/photo/2018/10/16/15/01/background-image-3751623_1280.jpg"
                      }
                      alt="Img"
                      className="w-full h-[12rem] object-cover object-center"
                    />
                    {/* Hidden file input */}
                    <input
                      type="file"
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      name="backgroundImage"
                    />
                  </div>
                </div>

                <div className="w-full transform -translate-y-20 translate-x-4 h-[6rem]">
                  <div className="relative borde ">
                    <Avatar
                      src={
                        formik.values.image 
                      }
                      alt="Img"
                      sx={{
                        width: "10rem",
                        height: "10rem",
                        border: "4px solid white",
                      }}
                    />
                    {/* Hidden file input */}
                    <input
                      type="file"
                      className="absolute top-0 left-0 w-[10rem] h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      name="image"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <TextField
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.name && formik.errors.fullName}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  id="bio"
                  name="bio"
                  label="Bio"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  error={formik.touched.bio && Boolean(formik.errors.bio)}
                  helperText={formik.touched.bio && formik.errors.bio}
                />
                <TextField
                  fullWidth
                  id="website"
                  name="website"
                  label="Website"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.website && Boolean(formik.errors.website)
                  }
                  helperText={formik.touched.website && formik.errors.website}
                />
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              
                <div className="my-3">
                  <p className="text-lg font-semibold mb-3">Professional Information</p>
                  <TextField
                    fullWidth
                    id="education"
                    name="education"
                    label="Education"
                    value={formik.values.education}
                    onChange={formik.handleChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    id="skills"
                    name="skills"
                    label="Skills (comma separated)"
                    value={formik.values.skills}
                    onChange={formik.handleChange}
                    helperText="Enter your skills separated by commas"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    id="experience"
                    name="experience"
                    label="Experience"
                    multiline
                    rows={3}
                    value={formik.values.experience}
                    onChange={formik.handleChange}
                    helperText="Describe your professional experience"
                  />
                </div>
              </div>
            </div>
            <BackdropComponent open={uploading}/>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default ProfileModel;
