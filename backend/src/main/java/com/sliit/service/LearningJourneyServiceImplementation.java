package com.sliit.service;

import com.sliit.model.LearningJourney;
import com.sliit.model.Twit;
import com.sliit.model.User;
import com.sliit.repository.LearningJourneyRepository;
import com.sliit.repository.TwitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LearningJourneyServiceImplementation implements LearningJourneyService {
    private static final Logger logger = LoggerFactory.getLogger(LearningJourneyServiceImplementation.class);

    @Autowired
    private LearningJourneyRepository learningJourneyRepository;

    @Autowired
    private TwitRepository twitRepository;

    @Override
    public LearningJourney createLearningJourney(LearningJourney journey, User user) {
        try {
            logger.info("Creating learning journey: {}", journey);
            
            // Set the user and initial status
            journey.setUser(user);
            journey.setStatus(LearningJourney.JourneyStatus.PENDING);
            journey.setCreatedAt(LocalDateTime.now());
            
            LearningJourney createdJourney = learningJourneyRepository.save(journey);
            logger.info("Successfully created learning journey with ID: {}", createdJourney.getId());
            
            return createdJourney;
        } catch (Exception e) {
            logger.error("Error creating learning journey: ", e);
            throw e;
        }
    }

    @Override
    public List<LearningJourney> getLearningJourneysByUserId(Long userId) {
        try {
            logger.info("Fetching learning journeys for user: {}", userId);
            List<LearningJourney> journeys = learningJourneyRepository.findByUserId(userId);
            logger.info("Found {} learning journeys for user {}", journeys.size(), userId);
            return journeys;
        } catch (Exception e) {
            logger.error("Error fetching learning journeys: ", e);
            throw e;
        }
    }

    @Override
    public LearningJourney updateJourneyStatus(Long journeyId, LearningJourney.JourneyStatus status) {
        try {
            logger.info("Updating journey {} status to {}", journeyId, status);
            LearningJourney journey = learningJourneyRepository.findById(journeyId)
                    .orElseThrow(() -> new RuntimeException("Journey not found"));
            
            journey.setStatus(status);
            LearningJourney updatedJourney = learningJourneyRepository.save(journey);
            logger.info("Successfully updated journey status");
            
            return updatedJourney;
        } catch (Exception e) {
            logger.error("Error updating journey status: ", e);
            throw e;
        }
    }

    @Override
    public void deleteJourney(Long journeyId) {
        try {
            logger.info("Deleting journey: {}", journeyId);
            learningJourneyRepository.deleteById(journeyId);
            logger.info("Successfully deleted journey");
        } catch (Exception e) {
            logger.error("Error deleting journey: ", e);
            throw e;
        }
    }

    @Override
    public LearningJourney updateLearningJourney(Long journeyId, LearningJourney journey) {
        LearningJourney existingJourney = learningJourneyRepository.findById(journeyId)
            .orElseThrow(() -> new RuntimeException("Learning journey not found"));

        // Update only the allowed fields
        existingJourney.setDescription(journey.getDescription());
        existingJourney.setStartDate(journey.getStartDate());
        existingJourney.setEndDate(journey.getEndDate());
        existingJourney.setEstimatedDuration(journey.getEstimatedDuration());
        existingJourney.setSkillLevel(journey.getSkillLevel());

        return learningJourneyRepository.save(existingJourney);
    }
} 