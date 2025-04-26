import { Avatar, Button, IconButton, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import ImageIcon from "@mui/icons-material/Image";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { createPost, getAllPosts } from "../../../Store/Post/Action";
import { uploadToCloudinary } from "../../../Utils/UploadToCloudinary";
import BackdropComponent from "../../Backdrop/Backdrop";
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SkillPost from './SkillPost';
import LearningJourneyForm from '../../LearningJourney/LearningJourneyForm';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';

const MAX_IMAGES = 3;
const MAX_VIDEO_DURATION = 30; // in seconds
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const validationSchema = Yup.object().shape({
  content: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
});

const HomeSection = () => {
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [learningJourneyOpen, setLearningJourneyOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const posts = useSelector((state) => state.post.posts);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  const checkVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION) {
          reject(new Error(`Video duration must not exceed ${MAX_VIDEO_DURATION} seconds`));
        }
        setVideoDuration(video.duration);
        resolve(true);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (values, actions) => {
    try {
      // Check if content is empty and no media is selected
      if (!values.content.trim() && selectedImages.length === 0 && !selectedVideo) {
        return;
      }

      if (!values.content.trim()) {
        alert("Please enter a description");
        return;
      }

      setUploadingMedia(true);
      
      // Handle multiple image uploads
      let imageUrls = [];
      if (selectedImages.length > 0) {
        try {
          // Upload all images in parallel
          const uploadPromises = selectedImages.map(image => 
            uploadToCloudinary(image, "image")
          );
          imageUrls = await Promise.all(uploadPromises);
          console.log("Uploaded image URLs:", imageUrls);
        } catch (error) {
          console.error("Error uploading images:", error);
          throw new Error("Failed to upload images. Please try again.");
        }
      }

      // Handle video
      let videoUrl = null;
      if (selectedVideo) {
        try {
          videoUrl = await uploadToCloudinary(selectedVideo, "video");
          console.log("Uploaded video URL:", videoUrl);
        } catch (error) {
          console.error("Error uploading video:", error);
          throw new Error("Failed to upload video. Please try again.");
        }
      }

      // Get the JWT token with Bearer prefix
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("You must be logged in to create a post");
      }

      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append("content", values.content.trim());
      
      // Handle multiple image uploads
      if (imageUrls.length > 0) {
        imageUrls.forEach(url => formData.append("images", url));
      }
      
      if (videoUrl) {
        formData.append("video", videoUrl);
      }

      // Make the API call to create the post
      const response = await fetch("http://localhost:5454/api/twits/create", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Server response:", errorData);
        throw new Error('Failed to create post: ' + errorData);
      }

      const result = await response.json();
      
      if (result) {
        console.log("Post created successfully:", result);
        actions.resetForm();
        setSelectedImages([]);
        setSelectedVideo(null);
        setVideoDuration(0);
        // Refresh posts
        dispatch(getAllPosts());
      } else {
        throw new Error("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(error.message || "An error occurred while sharing your post. Please try again.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (selectedVideo) {
      alert("You cannot upload both images and video in the same post");
      return;
    }

    // Check total number of images
    if (selectedImages.length + files.length > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images per post`);
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is too large. Maximum file size is 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);
    }
    event.target.value = null;
  };

  const handleVideoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedImages.length > 0) {
      alert("You cannot upload both images and video in the same post");
      event.target.value = null;
      return;
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      alert("Please select a video file");
      event.target.value = null;
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert("Video size should be less than 10MB");
      event.target.value = null;
      return;
    }

    try {
      await checkVideoDuration(file);
      setSelectedVideo(file);
    } catch (error) {
      alert(error.message);
    }
    event.target.value = null;
  };

  const removeImage = (index, e) => {
    // Prevent event propagation to avoid form submission
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Only reset form if this was the last image
    if (selectedImages.length === 1) {
      formik.resetForm();
    }
  };

  const removeVideo = (e) => {
    // Prevent event propagation to avoid form submission
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedVideo(null);
    setVideoDuration(0);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      content: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const handleOpenLearningJourney = (postId) => {
    setSelectedPostId(postId);
    setLearningJourneyOpen(true);
  };

  const handleCloseLearningJourney = () => {
    setLearningJourneyOpen(false);
    setSelectedPostId(null);
  };

  return (
    <div className="w-full">
      <div className="border border-r-[1px] border-l-[1px] border-gray-200">
        <div className="w-full">
          <section>
            <h1 className="py-5 text-xl font-bold opacity-90">Share Your Skills</h1>
            <div className="border border-gray-100 p-5 rounded-lg">
              <div className="flex space-x-5">
                <Avatar alt={auth.user?.fullName} src={auth.user?.image} />
                <div className="w-full">
                  <form onSubmit={formik.handleSubmit}>
                    <div>
                      <textarea
                        name="content"
                        placeholder="Share your skills and knowledge... (Describe what you're teaching or showcasing)"
                        className="border-none outline-none text-xl bg-transparent w-full resize-none"
                        rows={3}
                        {...formik.getFieldProps("content")}
                      />
                      {formik.errors.content && formik.touched.content && (
                        <span className="text-red-500">{formik.errors.content}</span>
                      )}
                    </div>

                    {/* Preview selected images */}
                    {selectedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Selected ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => removeImage(index, e)}
                              className="absolute top-1 right-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                              title="Remove image"
                            >
                              <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preview selected video */}
                    {selectedVideo && (
                      <div className="mt-4 relative">
                        <video
                          src={URL.createObjectURL(selectedVideo)}
                          className="w-full max-h-96 rounded-lg"
                          controls
                        />
                        <div className="absolute top-2 right-2 flex items-center space-x-2">
                          <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                            {videoDuration.toFixed(1)}s
                          </span>
                          <button
                            type="button"
                            onClick={(e) => removeVideo(e)}
                            className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                            title="Remove video"
                          >
                            <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-5">
                      <div className="flex space-x-5 items-center">
                        <label className="flex items-center space-x-2 rounded-md cursor-pointer" title={`Upload up to ${MAX_IMAGES} images`}>
                          <ImageIcon className="text-[#1d9bf0]" />
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                            disabled={selectedVideo !== null}
                          />
                          <span className="text-sm text-gray-500">{`(${selectedImages.length}/${MAX_IMAGES})`}</span>
                        </label>
                        <label className="flex items-center space-x-2 rounded-md cursor-pointer" title={`Upload video (max ${MAX_VIDEO_DURATION}s)`}>
                          <VideoLibraryIcon className="text-[#1d9bf0]" />
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoSelect}
                            disabled={selectedImages.length > 0}
                          />
                        </label>
                      </div>

                      <div>
                        <Button
                          sx={{
                            width: "100%",
                            borderRadius: "20px",
                            paddingY: "8px",
                            paddingX: "20px",
                            bgcolor: "#1d9bf0",
                          }}
                          variant="contained"
                          type="submit"
                          disabled={uploadingMedia || !formik.values.content.trim()}
                        >
                          Share Skill
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {!posts || posts.length === 0 ? (
              <div className="text-center py-5 text-gray-500">
                No skills shared yet. Be the first to share your knowledge!
              </div>
            ) : (
              posts.map((item) => (
                <div key={item.id} className="border-t-[1px] border-gray-200 relative">
                  <IconButton 
                    onClick={() => handleOpenLearningJourney(item.id)}
                    sx={{ 
                      color: '#757575',
                      position: 'absolute',
                      bottom: 0,
                      right: 8,
                      zIndex: 1,
                      transform: 'translateY(0%)',
                      padding: 1.5
                    }}
                  >
                    <Tooltip title="Create new learning journey" arrow>
                      <AddIcon style={{ fontSize: '30px' }} />
                    </Tooltip>
                  </IconButton>
                  <SkillPost post={item} />
                </div>
              ))
            )}
          </section>
        </div>
      </div>
      <LearningJourneyForm
        open={learningJourneyOpen}
        onClose={handleCloseLearningJourney}
        postId={selectedPostId}
      />
      <BackdropComponent open={uploadingMedia} />
    </div>
  );
};

export default HomeSection;
