import React, { useState } from 'react'
import { 
    Avatar, 
    Card, 
    CardContent, 
    CardHeader, 
    CardActions, 
    IconButton, 
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ImageList,
    ImageListItem,
    Modal,
    Box
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CommentIcon from '@mui/icons-material/Comment'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import { useDispatch, useSelector } from 'react-redux'
import { likePost, deletePost, updatePost, getAllPosts, removeImageFromPost } from '../../../Store/Post/Action'
import { uploadToCloudinary } from '../../../Utils/UploadToCloudinary'

// Helper function to format relative time
const getRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';
    
    // Parse the date string from the backend
    const postDate = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(postDate.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Just now';
    }
    
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

const SkillPost = ({ post }) => {
    const dispatch = useDispatch();
    const { auth, theme } = useSelector(state => state);
    const [editOpen, setEditOpen] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [editImages, setEditImages] = useState(post.images || []);
    const [editVideo, setEditVideo] = useState(post.video || null);
    const [editVideoDuration, setEditVideoDuration] = useState(post.videoDuration || 0);
    const [newImages, setNewImages] = useState([]);
    const [newVideo, setNewVideo] = useState(null);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    
    // Debug logging for date
    console.log('Post createdAt:', post.createdAt);
    console.log('Post createdAt type:', typeof post.createdAt);
    console.log('Post createdAt parsed:', new Date(post.createdAt));
    
    const isOwner = post.user?.id === auth.user?.id;
    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now';
    const relativeTime = getRelativeTime(post.createdAt);
    const isLiked = post.likes?.some(like => like.id === auth.user?.id);

    const handleLike = () => {
        dispatch(likePost(post.id));
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this skill post?')) {
            try {
                const response = await dispatch(deletePost(post.id));
                if (!response.success) {
                    alert(response.error || 'Failed to delete post. Please try again.');
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                alert('An error occurred while deleting the post. Please try again.');
            }
        }
    };

    const handleEdit = () => {
        setEditContent(post.content);
        setEditImages(post.images || []);
        setEditVideo(post.video || null);
        setEditVideoDuration(post.videoDuration || 0);
        setNewImages([]);
        setNewVideo(null);
        setEditOpen(true);
    };

    const handleNewImageSelect = (event) => {
        const files = Array.from(event.target.files);
        
        if (editVideo || newVideo) {
            alert("You cannot upload both images and video in the same post");
            return;
        }

        // Check total number of images
        if (editImages.length + newImages.length + files.length > 3) {
            alert(`You can only upload up to 3 images per post`);
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
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum file size is 10MB`);
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            setNewImages(prev => [...prev, ...validFiles]);
        }
        event.target.value = null;
    };

    const handleNewVideoSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (editImages.length > 0 || newImages.length > 0) {
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
        if (file.size > 10 * 1024 * 1024) {
            alert("Video size should be less than 10MB");
            event.target.value = null;
            return;
        }

        try {
            // Check video duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = function() {
                    window.URL.revokeObjectURL(video.src);
                    if (video.duration > 30) {
                        reject(new Error("Video duration must not exceed 30 seconds"));
                    }
                    setEditVideoDuration(video.duration);
                    resolve();
                };
                
                video.src = URL.createObjectURL(file);
            });
            
            setNewVideo(file);
        } catch (error) {
            alert(error.message);
        }
        event.target.value = null;
    };

    const removeEditImage = async (index, isNewImage) => {
        try {
            if (isNewImage) {
                setNewImages(prev => {
                    const updated = prev.filter((_, i) => i !== index);
                    return updated;
                });
            } else {
                const imageToRemove = editImages[index];
                const response = await dispatch(removeImageFromPost(post.id, imageToRemove));
                
                if (response.success) {
                    setEditImages(prev => {
                        const updated = prev.filter((_, i) => i !== index);
                        return updated;
                    });
                } else {
                    alert(response.error || 'Failed to remove image. Please try again.');
                }
            }
        } catch (error) {
            console.error("Error removing image:", error);
            alert('An error occurred while removing the image. Please try again.');
        }
    };

    const removeEditVideo = () => {
        setEditVideo(null);
        setNewVideo(null);
        setEditVideoDuration(0);
    };

    const handleUpdatePost = async () => {
        try {
            setUploadingMedia(true);
            
            const formData = new FormData();
            formData.append('content', editContent);
            
            // Handle existing images and new images together
            const allImages = [...editImages];
            
            // Upload and add new images
            if (newImages.length > 0) {
                const uploadPromises = newImages.map(image => 
                    uploadToCloudinary(image, "image")
                );
                const newImageUrls = await Promise.all(uploadPromises);
                allImages.push(...newImageUrls);
            }
            
            // Always send the complete list of images
            if (allImages.length > 0) {
                // Convert the array to a JSON string to ensure proper serialization
                formData.append('images', JSON.stringify(allImages));
            }
            
            // Handle video
            if (editVideo) {
                formData.append('video', editVideo);
                if (editVideoDuration) {
                    formData.append('videoDuration', editVideoDuration);
                }
            } else if (newVideo) {
                const videoUrl = await uploadToCloudinary(newVideo, "video");
                formData.append('video', videoUrl);
                formData.append('videoDuration', editVideoDuration);
            }

            console.log("Sending update with formData:");
            for (let pair of formData.entries()) {
                console.log(pair[0], ':', pair[1]);
            }

            const response = await dispatch(updatePost(post.id, formData));
            
            if (response && response.success) {
                console.log("Post updated successfully:", response.data);
                
                // Force a refresh of the posts to ensure UI is updated
                dispatch(getAllPosts());
                
                // Close the edit dialog
        setEditOpen(false);
                
                // Show success message
                alert("Post updated successfully!");
            } else {
                throw new Error(response?.error || "Failed to update post");
            }
        } catch (error) {
            console.error("Error updating post:", error);
            alert(error.message || 'An error occurred while updating the post. Please try again.');
        } finally {
            setUploadingMedia(false);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleCloseImagePreview = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <Card className={`w-full mb-4 ${theme.currentTheme === "dark" ? "bg-[#0D0D0D] text-white" : ""}`}>
                <CardHeader
                    avatar={
                        <Avatar 
                            src={post.user?.image} 
                            alt={post.user?.fullName || 'User'}
                        />
                    }
                    title={
                        <div className="flex items-center">
                            <span className="font-bold">{post.user?.fullName || 'Anonymous'}</span>
                            <span className="ml-2 text-sm text-gray-500">shared a skill</span>
                        </div>
                    }
                    subheader={
                        <div className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}>
                            <span>@{post.user?.fullName?.split(" ").join("_").toLowerCase() || 'anonymous'}</span>
                            <span className="mx-1">·</span>
                            <span title={formattedDate}>{relativeTime}</span>
                        </div>
                    }
                    action={
                        isOwner && (
                            <div>
                                <IconButton onClick={handleEdit}>
                                    <EditIcon className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"} />
                                </IconButton>
                                <IconButton onClick={handleDelete}>
                                    <DeleteIcon className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"} />
                                </IconButton>
                            </div>
                        )
                    }
                />
                <CardContent>
                    <Typography 
                        variant="body1" 
                        className={`whitespace-pre-wrap ${theme.currentTheme === "dark" ? "text-white" : "text-gray-800"}`}
                    >
                        {post.content}
                    </Typography>

                    {/* Display images in a responsive grid */}
                    {post.images && post.images.length > 0 && (
                        <div className="mt-4">
                            <div className={`grid gap-2 ${
                                post.images.length === 1 ? 'grid-cols-1' :
                                post.images.length === 2 ? 'grid-cols-2' :
                                post.images.length === 3 ? 'grid-cols-2' :
                                'grid-cols-2'
                            }`}>
                                {post.images.map((image, index) => (
                                    <div 
                                        key={index}
                                        className={`relative ${
                                            post.images.length === 3 && index === 0 ? 'col-span-2' : ''
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Skill content ${index + 1}`}
                                            loading="lazy"
                                            className="rounded-lg w-full h-full object-cover cursor-pointer transition-transform hover:opacity-90"
                                            style={{
                                                aspectRatio: post.images.length === 1 ? '16/9' :
                                                            post.images.length === 2 ? '1/1' :
                                                            post.images.length === 3 && index === 0 ? '16/9' : '1/1'
                                            }}
                                            onClick={() => handleImageClick(image)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Display video */}
                    {post.video && (
                        <div className="mt-4 relative">
                            <video
                                src={post.video}
                                controls
                                className="w-full rounded-lg"
                                style={{ aspectRatio: '16/9' }}
                            />
                            {post.videoDuration && (
                                <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {Math.round(post.videoDuration)}s
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardActions disableSpacing>
                    <IconButton onClick={handleLike}>
                        {isLiked ? (
                            <FavoriteIcon className="text-red-500" />
                        ) : (
                            <FavoriteBorderIcon className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"} />
                        )}
                    </IconButton>
                    <span className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        {post.likes?.length || 0}
                    </span>

                    <IconButton 
                        className="ml-2"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <CommentIcon className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"} />
                    </IconButton>
                    <span className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        {post.comments?.length || 0}
                    </span>
                </CardActions>
            </Card>

            {/* Edit Dialog */}
            <Dialog 
                open={editOpen} 
                onClose={() => setEditOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edit Skill Post</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                    />
                    
                    {/* Display existing images */}
                    {editImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            {editImages.map((image, index) => (
                                <div key={`existing-${index}`} className="relative">
                                    <img
                                        src={image}
                                        alt={`Existing ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeEditImage(index, false);
                                        }}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                        title="Remove image"
                                    >
                                        <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Display new images */}
                    {newImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            {newImages.map((image, index) => (
                                <div key={`new-${index}`} className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`New ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeEditImage(index, true);
                                        }}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                        title="Remove image"
                                    >
                                        <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Display existing video */}
                    {editVideo && (
                        <div className="mt-4 relative">
                            <video
                                src={editVideo}
                                className="w-full max-h-96 rounded-lg"
                                controls
                            />
                            <div className="absolute top-2 right-2 flex items-center space-x-2">
                                <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                    {editVideoDuration.toFixed(1)}s
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeEditVideo();
                                    }}
                                    className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                    title="Remove video"
                                >
                                    <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Display new video */}
                    {newVideo && (
                        <div className="mt-4 relative">
                            <video
                                src={URL.createObjectURL(newVideo)}
                                className="w-full max-h-96 rounded-lg"
                                controls
                            />
                            <div className="absolute top-2 right-2 flex items-center space-x-2">
                                <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                    {editVideoDuration.toFixed(1)}s
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeEditVideo();
                                    }}
                                    className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                    title="Remove video"
                                >
                                    <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Media upload buttons */}
                    <div className="flex space-x-5 items-center mt-4">
                        <label className="flex items-center space-x-2 rounded-md cursor-pointer" title="Upload up to 3 images">
                            <ImageIcon className="text-[#1d9bf0]" />
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleNewImageSelect}
                                disabled={editVideo !== null || newVideo !== null}
                            />
                            <span className="text-sm text-gray-500">{`(${editImages.length + newImages.length}/3)`}</span>
                        </label>
                        <label className="flex items-center space-x-2 rounded-md cursor-pointer" title="Upload video (max 30s)">
                            <VideoLibraryIcon className="text-[#1d9bf0]" />
                            <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleNewVideoSelect}
                                disabled={editImages.length > 0 || newImages.length > 0}
                            />
                        </label>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleUpdatePost}
                        variant="contained"
                        disabled={uploadingMedia}
                    >
                        {uploadingMedia ? "Updating..." : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Preview Modal */}
            <Modal
                open={!!selectedImage}
                onClose={handleCloseImagePreview}
                aria-labelledby="image-preview-modal"
                className="flex items-center justify-center"
            >
                <Box className="relative max-w-[90vw] max-h-[90vh] outline-none">
                    <IconButton
                        onClick={handleCloseImagePreview}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 z-10"
                        size="small"
                    >
                        <CloseIcon className="text-white" />
                    </IconButton>
                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    />
                </Box>
            </Modal>
        </>
    );
};

export default SkillPost; 