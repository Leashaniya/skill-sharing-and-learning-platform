package com.zosh.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zosh.config.JwtProvider;
import com.zosh.exception.UserException;
import com.zosh.model.User;
import com.zosh.model.Twit;
import com.zosh.model.Like;
import com.zosh.repository.UserRepository;
import com.zosh.repository.TwitRepository;
import com.zosh.repository.LikeRepository;
import com.zosh.model.LearningJourney;
import com.zosh.repository.LearningJourneyRepository;

@Service
public class UserServiceImplementation implements UserService {
	
	private UserRepository userRepository;
	private JwtProvider jwtProvider;
	private TwitRepository twitRepository;
	private LikeRepository likeRepository;
	private LearningJourneyRepository learningJourneyRepository;
	private static final Logger logger = LoggerFactory.getLogger(UserServiceImplementation.class);
	
	public UserServiceImplementation(
			UserRepository userRepository,
			JwtProvider jwtProvider,
			TwitRepository twitRepository,
			LikeRepository likeRepository,
			LearningJourneyRepository learningJourneyRepository) {
		
		this.userRepository=userRepository;
		this.jwtProvider=jwtProvider;
		this.twitRepository = twitRepository;
		this.likeRepository = likeRepository;
		this.learningJourneyRepository = learningJourneyRepository;
		
	}

	@Override
	public User findUserById(Long userId) throws UserException {
		User user=userRepository.findById(userId).orElseThrow(() ->  new UserException("user not found with id "+userId));
		return user;
	}

	@Override
	public User findUserProfileByJwt(String jwt) throws UserException {
		try {
			String email = jwtProvider.getEmailFromJwtToken(jwt);
			
			logger.info("Looking for user with email: " + email);
			
			User user = userRepository.findByEmail(email);
			
			if (user == null) {
				logger.warn("User not found with email: " + email);
				throw new UserException("User not found");
			}
			
			logger.info("Found user: " + user.getEmail());
			return user;
		} catch (Exception e) {
			logger.error("Error finding user profile: " + e.getMessage());
			throw new UserException("User not found");
		}
	}

	@Override
	public User updateUser(Long userid,User req) throws UserException {
		
		User user=findUserById(userid);
		
		if(req.getFullName()!= null) {
			user.setFullName(req.getFullName());
		}
		if(req.getImage()!=null) {
			user.setImage(req.getImage());
		}
		if(req.getBackgroundImage()!=null) {
			user.setBackgroundImage(req.getBackgroundImage());
		}
		if(req.getBirthDate()!=null) {
			user.setBirthDate(req.getBirthDate());
		}
		if(req.getLocation()!=null) {
			user.setLocation(req.getLocation());
		}
		if(req.getBio()!=null) {
			user.setBio(req.getBio());
		}
		if(req.getWebsite()!=null) {
			user.setWebsite(req.getWebsite());
		}
		if(req.getEducation()!=null) {
			user.setEducation(req.getEducation());
		}
		if(req.getSkills()!=null) {
			user.setSkills(req.getSkills());
		}
		if(req.getExperience()!=null) {
			user.setExperience(req.getExperience());
		}
		
		return userRepository.save(user);
		
	}

	@Override
	public User followUser(Long userId, User user) throws UserException {
		User followToUser=findUserById(userId);
		
		if(user.getFollowings().contains(followToUser) && followToUser.getFollowers().contains(user)) {
			user.getFollowings().remove(followToUser);
			followToUser.getFollowers().remove(user);
		}
		else {
					followToUser.getFollowers().add(user);
					user.getFollowings().add(followToUser);
		}
		
		userRepository.save(user);
		userRepository.save(followToUser);
		return followToUser;
	}

	@Override
	public List<User> searchUser(String query) {
		return userRepository.searchUser(query);
	}

	@Override
	@Transactional
	public void deleteUser(Long userId) throws UserException {
		try {
			logger.info("Attempting to delete user with ID: " + userId);
			
			// First check if user exists
			User user = userRepository.findById(userId)
				.orElseThrow(() -> new UserException("User not found with ID: " + userId));
			
			logger.info("Found user: " + user.getEmail());
			
			// Log the current state of relationships
			logger.info("Current followers count: " + user.getFollowers().size());
			logger.info("Current followings count: " + user.getFollowings().size());
			logger.info("Current tweets count: " + user.getTwit().size());
			logger.info("Current likes count: " + user.getLikes().size());
			
			// Delete all learning journeys associated with the user
			List<LearningJourney> learningJourneys = learningJourneyRepository.findByUserId(userId);
			for (LearningJourney journey : learningJourneys) {
				learningJourneyRepository.delete(journey);
			}
			
			// Remove user from followers' followings list
			for (User follower : user.getFollowers()) {
				follower.getFollowings().remove(user);
				userRepository.save(follower);
			}
			
			// Remove user from followings' followers list
			for (User following : user.getFollowings()) {
				following.getFollowers().remove(user);
				userRepository.save(following);
			}
			
			// Delete all tweets associated with the user
			for (Twit twit : user.getTwit()) {
				twitRepository.delete(twit);
			}
			
			// Delete all likes associated with the user
			for (Like like : user.getLikes()) {
				likeRepository.delete(like);
			}
			
			// Clear all relationships
			user.getFollowers().clear();
			user.getFollowings().clear();
			user.getTwit().clear();
			user.getLikes().clear();
			
			// Save the user to update relationships
			userRepository.save(user);
			logger.info("Relationships cleared and saved");
			
			// Now delete the user
			userRepository.delete(user);
			logger.info("User successfully deleted");
			
		} catch (Exception e) {
			logger.error("Error in deleteUser: " + e.getMessage(), e);
			throw new UserException("Error deleting user: " + e.getMessage());
		}
	}

}
   




