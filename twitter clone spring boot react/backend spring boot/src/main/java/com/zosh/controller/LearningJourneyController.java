package com.zosh.controller;

import com.zosh.model.LearningJourney;
import com.zosh.model.User;
import com.zosh.service.LearningJourneyService;
import com.zosh.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/learning-journeys")
public class LearningJourneyController {
    private static final Logger logger = LoggerFactory.getLogger(LearningJourneyController.class);

    @Autowired
    private LearningJourneyService learningJourneyService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<LearningJourney> createLearningJourney(
            @RequestBody LearningJourney journey,
            @RequestHeader("Authorization") String jwt) throws Exception {
        try {
            logger.info("Creating learning journey: {}", journey);
            User user = userService.findUserProfileByJwt(jwt);
            logger.info("Found user: {}", user.getId());
            
            // Set the user for the journey
            journey.setUser(user);
            
            LearningJourney createdJourney = learningJourneyService.createLearningJourney(journey, user);
            logger.info("Successfully created learning journey with ID: {}", createdJourney.getId());
            
            return new ResponseEntity<>(createdJourney, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating learning journey: ", e);
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<LearningJourney>> getLearningJourneys(
            @RequestHeader("Authorization") String jwt) throws Exception {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            List<LearningJourney> journeys = learningJourneyService.getLearningJourneysByUserId(user.getId());
            logger.info("Retrieved {} learning journeys for user {}", journeys.size(), user.getId());
            return new ResponseEntity<>(journeys, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving learning journeys: ", e);
            throw e;
        }
    }

    @PutMapping("/{journeyId}/complete")
    public ResponseEntity<LearningJourney> completeJourney(
            @PathVariable Long journeyId,
            @RequestHeader("Authorization") String jwt) throws Exception {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            LearningJourney updatedJourney = learningJourneyService.updateJourneyStatus(
                journeyId, 
                LearningJourney.JourneyStatus.COMPLETED
            );
            logger.info("Successfully marked journey {} as completed", journeyId);
            return new ResponseEntity<>(updatedJourney, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error completing journey: ", e);
            throw e;
        }
    }

    @DeleteMapping("/{journeyId}")
    public ResponseEntity<Void> deleteJourney(
            @PathVariable Long journeyId,
            @RequestHeader("Authorization") String jwt) throws Exception {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            learningJourneyService.deleteJourney(journeyId);
            logger.info("Successfully deleted journey {}", journeyId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting journey: ", e);
            throw e;
        }
    }

    @PutMapping("/{journeyId}")
    public ResponseEntity<LearningJourney> updateLearningJourney(
            @PathVariable Long journeyId,
            @RequestBody LearningJourney journey,
            @RequestHeader("Authorization") String jwt) throws Exception {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            LearningJourney updatedJourney = learningJourneyService.updateLearningJourney(journeyId, journey);
            logger.info("Successfully updated journey {}", journeyId);
            return new ResponseEntity<>(updatedJourney, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating learning journey: ", e);
            throw e;
        }
    }
} 