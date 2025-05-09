import axios from 'axios';
import { API_BASE_URL } from '../../Config/apiConfig';
import { toast } from 'react-toastify';

export const createComment = (twitId, content) => async (dispatch) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(
            `${API_BASE_URL}/api/twits/reply`,
            { 
                content,
                twitId 
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        toast.success('Comment posted!');
        return response.data;
    } catch (error) {
        toast.error('Failed to post comment.');
        console.error('Error creating comment:', error);
        throw error;
    }
};

export const getComments = (twitId) => async (dispatch) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(
            `${API_BASE_URL}/api/twits/${twitId}/details`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.replyTwits || [];
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

export const editComment = (commentId, content) => async (dispatch) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.put(
            `${API_BASE_URL}/api/twits/${commentId}`,
            null,
            {
                params: { content },
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );
        toast.info('Comment updated!');
        return response.data;
    } catch (error) {
        toast.error('Failed to update comment.');
        console.error('Error editing comment:', error);
        throw error;
    }
};

export const deleteComment = (commentId) => async (dispatch) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.delete(
            `${API_BASE_URL}/api/twits/${commentId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );
        toast.success('Comment deleted!');
        return response.data;
    } catch (error) {
        toast.error('Failed to delete comment.');
        console.error('Error deleting comment:', error);
        throw error;
    }
}; 