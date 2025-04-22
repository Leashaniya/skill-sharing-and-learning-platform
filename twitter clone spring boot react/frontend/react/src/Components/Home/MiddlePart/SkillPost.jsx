const handleUpdatePost = async () => {
    try {
        setUploadingMedia(true);
        
        const formData = new FormData();
        formData.append('content', editContent);
        
        // Check file sizes before uploading
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
        
        // Check new images size
        if (newImages.length > 0) {
            for (const image of newImages) {
                if (image.size > MAX_FILE_SIZE) {
                    throw new Error(`Image ${image.name} exceeds 10MB limit`);
                }
            }
            
            try {
                const uploadPromises = newImages.map(image => 
                    uploadToCloudinary(image, "image")
                );
                const newImageUrls = await Promise.all(uploadPromises);
                newImageUrls.forEach(url => {
                    formData.append('images', url);
                });
            } catch (error) {
                console.error("Error uploading images:", error);
                throw new Error("Failed to upload images. Please try again.");
            }
        }
        
        // Always include existing images
        if (editImages && editImages.length > 0) {
            editImages.forEach(image => {
                formData.append('images', image);
            });
        }
        
        // Check video size
        if (newVideo) {
            if (newVideo.size > MAX_FILE_SIZE) {
                throw new Error(`Video ${newVideo.name} exceeds 10MB limit`);
            }
            
            try {
                const videoUrl = await uploadToCloudinary(newVideo, "video");
                formData.append('video', videoUrl);
                formData.append('videoDuration', editVideoDuration);
            } catch (error) {
                console.error("Error uploading video:", error);
                throw new Error("Failed to upload video. Please try again.");
            }
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
            await dispatch(getAllPosts());
            
            // Close the edit dialog
            setEditOpen(false);
            
            // Show success message
            alert("Post updated successfully!");
        } else {
            throw new Error(response?.error || "Failed to update post");
        }
    } catch (error) {
        console.error("Error updating post:", error);
        let errorMessage = 'An error occurred while updating the post. Please try again.';
        
        if (error.message.includes('Network Error')) {
            errorMessage = 'Network error occurred. Please check your connection and try again.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('exceeds 10MB limit')) {
            errorMessage = error.message;
        } else if (error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        
        alert(errorMessage);
    } finally {
        setUploadingMedia(false);
    }
}; 