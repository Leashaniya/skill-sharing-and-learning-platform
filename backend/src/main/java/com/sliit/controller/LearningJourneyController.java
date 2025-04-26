package com.sliit.controller;

import com.sliit.model.LearningJourney;
import com.sliit.model.User;
import com.sliit.service.LearningJourneyService;
import com.sliit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-journeys")
public class LearningJourneyController {
    private static final Logger logger = LoggerFactory.getLogger(LearningJourneyController.class);

    @Autowired
    private LearningJourneyService learningJourneyService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createLearningJourney(
            @RequestBody LearningJourney journey,
            @RequestHeader("Authorization") String jwt) {
        try {
            logger.info("Creating learning journey: {}", journey);
            User user = userService.findUserProfileByJwt(jwt);
            logger.info("Found user: {}", user.getId());
            
            journey.setUser(user);
            LearningJourney createdJourney = learningJourneyService.createLearningJourney(journey, user);
            logger.info("Successfully created learning journey with ID: {}", createdJourney.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Learning journey created successfully");
            response.put("journey", createdJourney);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            logger.error("Error creating learning journey: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create learning journey: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getLearningJourneys(
            @RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            List<LearningJourney> journeys = learningJourneyService.getLearningJourneysByUserId(user.getId());
            logger.info("Retrieved {} learning journeys for user {}", journeys.size(), user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("journeys", journeys);
            response.put("count", journeys.size());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Content-Type-Options", "nosniff");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response);
        } catch (Exception e) {
            logger.error("Error retrieving learning journeys: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve learning journeys: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }

    @PutMapping("/{journeyId}/complete")
    public ResponseEntity<?> completeJourney(
            @PathVariable Long journeyId,
            @RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            LearningJourney updatedJourney = learningJourneyService.updateJourneyStatus(
                journeyId, 
                LearningJourney.JourneyStatus.COMPLETED
            );
            logger.info("Successfully marked journey {} as completed", journeyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Journey marked as completed");
            response.put("journey", updatedJourney);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            logger.error("Error completing journey: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to complete journey: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }

    @DeleteMapping("/{journeyId}")
    public ResponseEntity<?> deleteJourney(
            @PathVariable Long journeyId,
            @RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            learningJourneyService.deleteJourney(journeyId);
            logger.info("Successfully deleted journey {}", journeyId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Journey deleted successfully");
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            logger.error("Error deleting journey: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete journey: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }

    @PutMapping("/{journeyId}")
    public ResponseEntity<?> updateLearningJourney(
            @PathVariable Long journeyId,
            @RequestBody LearningJourney journey,
            @RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            LearningJourney updatedJourney = learningJourneyService.updateLearningJourney(journeyId, journey);
            logger.info("Successfully updated journey {}", journeyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Journey updated successfully");
            response.put("journey", updatedJourney);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            logger.error("Error updating learning journey: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update journey: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }
} 