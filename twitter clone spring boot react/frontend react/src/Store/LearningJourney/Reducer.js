import { CREATE_LEARNING_JOURNEY, FETCH_LEARNING_JOURNEYS } from './Action';

const initialState = {
  learningJourneys: [],
  loading: false,
  error: null
};

export const learningJourneyReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_LEARNING_JOURNEY:
      return {
        ...state,
        learningJourneys: [...state.learningJourneys, action.payload],
        loading: false
      };
    case FETCH_LEARNING_JOURNEYS:
      return {
        ...state,
        learningJourneys: action.payload,
        loading: false
      };
    default:
      return state;
  }
}; 