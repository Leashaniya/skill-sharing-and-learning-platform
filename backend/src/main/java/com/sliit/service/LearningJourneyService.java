package com.sliit.service;

import com.sliit.model.LearningJourney;
import com.sliit.model.User;

import java.util.List;

public interface LearningJourneyService {
    LearningJourney createLearningJourney(LearningJourney journey, User user);
    List<LearningJourney> getLearningJourneysByUserId(Long userId);
    LearningJourney updateJourneyStatus(Long journeyId, LearningJourney.JourneyStatus status);
    void deleteJourney(Long journeyId);
    LearningJourney updateLearningJourney(Long journeyId, LearningJourney journey);
} 