import React, { useState, useEffect } from 'react'
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
import { likePost, deletePost, updatePost, getAllPosts, removeImageFromPost, getPostDetails } from '../../../Store/Post/Action'
import { uploadToCloudinary } from '../../../Utils/UploadToCloudinary'
import { createComment, editComment, deleteComment } from '../../../Store/Twit/Action'
import { toast } from 'react-toastify'

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

const SkillPost = ({ post, liked, noOfLikes }) => {
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
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.replyTwits || []);
    const [isLiked, setIsLiked] = useState(post.likes?.some(like => like.user?.id === auth.user?.id));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);
    const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    
    const isOwner = auth.user ? post.user?.id === auth.user.id : false;
    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now';
    const relativeTime = getRelativeTime(post.createdAt);

    // Fetch post details when component mounts
    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const postDetails = await dispatch(getPostDetails(post.id));
                if (postDetails) {
                    setIsLiked(postDetails.likes?.some(like => like.user?.id === auth.user?.id));
                    setLikeCount(postDetails.likes?.length || 0);
                    setComments(postDetails.replyTwits || []);
                }
            } catch (error) {
                console.error('Error fetching post details:', error);
            }
        };

        fetchPostDetails();
    }, [post.id, dispatch, auth.user?.id]);

    const handleLike = async () => {
        try {
            const response = await dispatch(likePost(post.id));
            console.log("Like response:", response);
            
            // Update local state based on the response
            if (response && response.data) {
                setIsLiked(!isLiked);
                setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
                
                // Refresh post details after like
                const postDetails = await dispatch(getPostDetails(post.id));
                if (postDetails) {
                    setIsLiked(postDetails.likes?.some(like => like.user?.id === auth.user?.id));
                    setLikeCount(postDetails.likes?.length || 0);
                }
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };

    const handleDelete = () => {
        setShowDeletePostDialog(true);
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
            toast.error("You can only upload up to 3 images per post");
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
                toast.success("Post updated successfully!");
            } else {
                throw new Error(response?.error || "Failed to update post");
            }
        } catch (error) {
            console.error("Error updating post:", error);
            toast.error(error.message || 'An error occurred while updating the post. Please try again.');
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

    const handleComment = async () => {
        if (!auth.user) {
            toast.error("Please log in to comment");
            return;
        }

        if (!commentText.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        try {
            await dispatch(createComment(post.id, commentText.trim()));
            setCommentText('');
            setShowCommentModal(false);
            // Refresh comments
            const updatedPost = await dispatch(getPostDetails(post.id));
            if (updatedPost) {
                setComments(updatedPost.replyTwits || []);
            }
        } catch (error) {
            console.error("Error creating comment:", error);
            toast.error(error.response?.data?.message || "Failed to create comment. Please try again.");
        }
    };

    const handleEditComment = async (commentId, currentContent) => {
        if (!auth.user) {
            alert("Please log in to edit comments");
            return;
        }
        setEditingCommentId(commentId);
        setEditCommentText(currentContent);
    };

    const handleSaveEdit = async (commentId) => {
        if (!auth.user) {
            alert("Please log in to edit comments");
            return;
        }

        if (!editCommentText.trim()) {
            alert("Please enter a comment");
            return;
        }

        try {
            await dispatch(editComment(commentId, editCommentText.trim()));
            setEditingCommentId(null);
            setEditCommentText('');
            // Refresh comments
            const updatedPost = await dispatch(getPostDetails(post.id));
            if (updatedPost) {
                setComments(updatedPost.replyTwits || []);
            }
        } catch (error) {
            console.error("Error editing comment:", error);
            alert(error.response?.data?.message || "Failed to edit comment. Please try again.");
        }
    };

    const handleDeleteComment = (commentId) => {
        if (!auth.user) {
            toast.error("Please log in to delete comments");
            return;
        }
        setDeleteCommentId(commentId);
        setShowDeleteCommentDialog(true);
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
                    {editVideo && (
                        <div className="mt-4 relative">
                            <video
                                src={editVideo}
                                controls
                                className="w-full rounded-lg"
                                style={{ aspectRatio: '16/9' }}
                            />
                            {editVideoDuration > 0 && (
                                <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {Math.round(editVideoDuration)}s
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={removeEditVideo}
                                className="absolute top-2 left-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                title="Remove video"
                            >
                                <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                            </button>
                        </div>
                    )}
                    {newVideo && (
                        <div className="mt-4 relative">
                            <video
                                src={URL.createObjectURL(newVideo)}
                                controls
                                className="w-full rounded-lg"
                                style={{ aspectRatio: '16/9' }}
                            />
                            {editVideoDuration > 0 && (
                                <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {Math.round(editVideoDuration)}s
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={removeEditVideo}
                                className="absolute top-2 left-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                title="Remove video"
                            >
                                <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                            </button>
                        </div>
                    )}
                </CardContent>

                <CardActions disableSpacing>
                    <IconButton onClick={handleLike}>
                        {liked ? (
                            <FavoriteIcon className="text-red-500" />
                        ) : (
                            <FavoriteBorderIcon className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"} />
                        )}
                    </IconButton>
                    <span className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        {noOfLikes}
                    </span>

                    <IconButton 
                        className="ml-2"
                        onClick={() => setShowCommentModal(true)}
                    >
                        <CommentIcon className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"} />
                    </IconButton>
                    <span className={theme.currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        {comments.length}
                    </span>
                </CardActions>
            </Card>

            {/* Comments Section */}
            {showCommentModal && (
                <Dialog
                    open={showCommentModal}
                    onClose={() => setShowCommentModal(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Comments</DialogTitle>
                    <DialogContent>
                        <div className="space-y-4">
                            {/* Comment Input */}
                            <div className="flex items-start space-x-2">
                                <Avatar 
                                    src={auth.user?.image} 
                                    alt={auth.user?.fullName}
                                    className="w-8 h-8"
                                />
                                <div className="flex-1">
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            variant="contained"
                                            onClick={handleComment}
                                            disabled={!commentText.trim()}
                                        >
                                            Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4 mt-4">
                                {comments.map((comment) => {
                                    const isCommentOwner = comment.user?.id === auth.user?.id;
                                    const isPostOwner = post.user?.id === auth.user?.id;
                                    const canEditOrDelete = isCommentOwner || isPostOwner;

                                    return (
                                        <div key={comment.id} className="flex items-start space-x-2">
                                            <Avatar 
                                                src={comment.user?.image} 
                                                alt={comment.user?.fullName}
                                                className="w-8 h-8"
                                            />
                                            <div className="flex-1">
                                                <div className="bg-gray-100 rounded-lg p-3">
                                                    <div className="font-semibold">
                                                        {comment.user?.fullName}
                                                    </div>
                                                    {editingCommentId === comment.id ? (
                                                        <div className="mt-2">
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                            <div className="flex justify-end mt-2 space-x-2">
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => setEditingCommentId(null)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() => handleSaveEdit(comment.id)}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="text-gray-700 mt-1">
                                                                {comment.replyContent || comment.content || comment.text}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {new Date(comment.createdAt).toLocaleString()}
                                                            </div>
                                                            {canEditOrDelete && (
                                                                <div className="flex justify-end mt-2 space-x-2">
                                                                    <Button
                                                                        variant="text"
                                                                        size="small"
                                                                        onClick={() => handleEditComment(comment.id, comment.content)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="text"
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowCommentModal(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

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
                                controls
                                className="w-full rounded-lg"
                                style={{ aspectRatio: '16/9' }}
                            />
                            {editVideoDuration > 0 && (
                                <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {Math.round(editVideoDuration)}s
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={removeEditVideo}
                                className="absolute top-2 left-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                title="Remove video"
                            >
                                <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                            </button>
                        </div>
                    )}
                    
                    {/* Display new video */}
                    {newVideo && (
                        <div className="mt-4 relative">
                            <video
                                src={URL.createObjectURL(newVideo)}
                                controls
                                className="w-full rounded-lg"
                                style={{ aspectRatio: '16/9' }}
                            />
                            {editVideoDuration > 0 && (
                                <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {Math.round(editVideoDuration)}s
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={removeEditVideo}
                                className="absolute top-2 left-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 transition-all"
                                title="Remove video"
                            >
                                <CloseIcon className="text-white" style={{ fontSize: '18px' }} />
                            </button>
                        </div>
                    )}
                    
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

            {/* Post Deletion Dialog */}
            <Dialog
                open={showDeletePostDialog}
                onClose={() => setShowDeletePostDialog(false)}
            >
                <DialogTitle>Delete Post</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this post?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeletePostDialog(false)}>Cancel</Button>
                    <Button
                        color="error"
                        onClick={async () => {
                            try {
                                const response = await dispatch(deletePost(post.id));
                                if (!response.success) {
                                    toast.error(response.error || 'Failed to delete post. Please try again.');
                                } else {
                                    toast.success('Post deleted!');
                                }
                            } catch (error) {
                                toast.error('An error occurred while deleting the post. Please try again.');
                            } finally {
                                setShowDeletePostDialog(false);
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Comment Deletion Dialog */}
            <Dialog
                open={showDeleteCommentDialog}
                onClose={() => setShowDeleteCommentDialog(false)}
            >
                <DialogTitle>Delete Comment</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this comment?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteCommentDialog(false)}>Cancel</Button>
                    <Button
                        color="error"
                        onClick={async () => {
                            try {
                                await dispatch(deleteComment(deleteCommentId));
                                toast.success("Comment deleted!");
                                // Refresh comments
                                const updatedPost = await dispatch(getPostDetails(post.id));
                                if (updatedPost) {
                                    setComments(updatedPost.replyTwits || []);
                                }
                            } catch (error) {
                                toast.error(error.response?.data?.message || "Failed to delete comment. Please try again.");
                            } finally {
                                setShowDeleteCommentDialog(false);
                                setDeleteCommentId(null);
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SkillPost; 