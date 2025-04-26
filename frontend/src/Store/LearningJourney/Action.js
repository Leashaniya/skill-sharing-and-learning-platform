import axios from 'axios';
import { API_BASE_URL } from '../../Config/apiConfig';

export const CREATE_LEARNING_JOURNEY = 'CREATE_LEARNING_JOURNEY';
export const FETCH_LEARNING_JOURNEYS = 'FETCH_LEARNING_JOURNEYS';

export const createLearningJourney = (journeyData) => async (dispatch) => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Format the data before sending
    const formattedData = {
      title: journeyData.title,
      description: journeyData.description,
      startDate: new Date(journeyData.startDate).toISOString(),
      endDate: new Date(journeyData.endDate).toISOString(),
      estimatedDuration: parseInt(journeyData.estimatedDuration),
      skillLevel: journeyData.skillLevel,
      post: {
        id: journeyData.postId
      }
    };

    console.log('Creating learning journey with data:', formattedData);

    const response = await axios.post(
      `${API_BASE_URL}/api/learning-journeys`,
      formattedData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Learning journey created successfully:', response.data);

    dispatch({
      type: CREATE_LEARNING_JOURNEY,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error creating learning journey:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchLearningJourneys = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log('Fetching learning journeys');

    const response = await axios.get(
      `${API_BASE_URL}/api/learning-journeys`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Learning journeys fetched successfully:', response.data);

    dispatch({
      type: FETCH_LEARNING_JOURNEYS,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching learning journeys:', error.response?.data || error.message);
    throw error;
  }
}; 