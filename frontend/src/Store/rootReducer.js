import { combineReducers } from "redux";
import authReducer from "./Auth/Reducer";
import postReducer from "./Post/Reducer";
import commentReducer from "./Comment/Reducer";
import likeReducer from "./Like/Reducer";
import userReducer from "./User/Reducer";
import twitReducer from "./Tweet/Reducer";
import themeReducer from "./Theme/Reducer";
import learningJourneyReducer from "./LearningJourney/Reducer";

const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  comment: commentReducer,
  like: likeReducer,
  user: userReducer,
  twit: twitReducer,
  theme: themeReducer,
  learningJourney: learningJourneyReducer
});

export default rootReducer; 