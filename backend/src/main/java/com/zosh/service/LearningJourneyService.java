package com.zosh.service;

import com.zosh.model.LearningJourney;
import com.zosh.model.User;

import java.util.List;

public interface LearningJourneyService {
    LearningJourney createLearningJourney(LearningJourney journey, User user);
    List<LearningJourney> getLearningJourneysByUserId(Long userId);
    LearningJourney updateJourneyStatus(Long journeyId, LearningJourney.JourneyStatus status);
    void deleteJourney(Long journeyId);
    LearningJourney updateLearningJourney(Long journeyId, LearningJourney journey);
} 