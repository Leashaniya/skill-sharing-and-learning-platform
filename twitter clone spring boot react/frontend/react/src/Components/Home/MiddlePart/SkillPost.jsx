const handleUpdatePost = async () => {
    try {
        setUploadingMedia(true);
        
        const formData = new FormData();
        formData.append('content', editContent);
        
        // Always include existing images
        if (editImages && editImages.length > 0) {
            editImages.forEach(image => {
                formData.append('images', image);
            });
        }
        
        // Add new images if any
        if (newImages.length > 0) {
            const uploadPromises = newImages.map(image => 
                uploadToCloudinary(image, "image")
            );
            const newImageUrls = await Promise.all(uploadPromises);
            newImageUrls.forEach(url => {
                formData.append('images', url);
            });
        }
        
        // Handle video
        if (newVideo) {
            const videoUrl = await uploadToCloudinary(newVideo, "video");
            formData.append('video', videoUrl);
            formData.append('videoDuration', editVideoDuration);
        } else if (editVideo) {
            formData.append('video', editVideo);
            if (editVideoDuration) {
                formData.append('videoDuration', editVideoDuration);
            }
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