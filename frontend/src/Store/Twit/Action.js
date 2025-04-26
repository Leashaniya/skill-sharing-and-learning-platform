import axios from 'axios';
import { API_BASE_URL } from '../../Config/apiConfig';

export const createComment = (twitId, content) => async (dispatch) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(
            `${API_BASE_URL}/api/twits/reply`,
            {
                content: content,
                twitId: twitId
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
};

export const getComments = (twitId) => async (dispatch) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(
            `${API_BASE_URL}/api/twits/${twitId}`,
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
            { content },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    } catch (error) {
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
        if (response.data && response.data.status) {
            return { status: true, message: response.data.message };
        }
        throw new Error(response.data?.message || 'Failed to delete comment');
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to delete comment');
    }
}; 