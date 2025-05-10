package com.sliit.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

import org.springdoc.core.converters.models.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;

import com.sliit.exception.TwitException;
import com.sliit.exception.UserException;
import com.sliit.model.Twit;
import com.sliit.model.User;
import com.sliit.repository.TwitRepository;
import com.sliit.request.TwitReplyRequest;
import com.sliit.request.TwitRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.model.LearningJourney;
import com.sliit.repository.LearningJourneyRepository;

@Service
@Transactional
public class TwitServiceImplementation implements TwitService {
	
	private TwitRepository twitRepository;
	private LearningJourneyRepository learningJourneyRepository;
	
	public TwitServiceImplementation(TwitRepository twitRepository, LearningJourneyRepository learningJourneyRepository) {
		this.twitRepository=twitRepository;
		this.learningJourneyRepository = learningJourneyRepository;
	}

	@Override
	public Twit createTwit(Twit req,User user) {
		Twit twit=new Twit();
		twit.setContent(req.getContent());
		twit.setCreatedAt(LocalDateTime.now());
		twit.setImages(req.getImages() != null ? req.getImages() : new ArrayList<>());
		twit.setUser(user);
		twit.setReply(false);
		twit.setTwit(true);
		twit.setVideo(req.getVideo());
		
		return twitRepository.save(twit);
	}

	@Override
	public Twit retwit(Long twitId, User user) throws TwitException {
		Twit twit=findById(twitId);
		if(twit.getRetwitUser().contains(user)) {
			twit.getRetwitUser().remove(user);
		}
		else {
			twit.getRetwitUser().add(user);
		}
		
		return twitRepository.save(twit);
	}

	@Override
	@Transactional(readOnly = true)
	public Twit findById(Long twitId) throws TwitException {
		Twit twit = twitRepository.findById(twitId)
				.orElseThrow(() -> new TwitException("Twit Not Found With Id " + twitId));
		
		// Initialize the collections
		twit.getLikes().size();
		twit.getReplyTwits().size();
		twit.getRetwitUser().size();
		
		return twit;
	}

	@Override
	@Transactional
	public void deleteTwitById(Long twitId, Long userId) throws TwitException, UserException {
		try {
			Twit twit = findById(twitId);
			
			// Allow comment author or parent post owner to delete a comment (reply)
			boolean isComment = twit.getReplyFor() != null;
			boolean isCommentAuthor = userId.equals(twit.getUser().getId());
			boolean isParentPostOwner = isComment && userId.equals(twit.getReplyFor().getUser().getId());

			if (!(isCommentAuthor || isParentPostOwner)) {
				throw new UserException("You can't delete this comment.");
			}
			
			// First delete all associated learning journeys
			List<LearningJourney> learningJourneys = learningJourneyRepository.findByPostId(twitId);
			if (learningJourneys != null && !learningJourneys.isEmpty()) {
				for (LearningJourney journey : learningJourneys) {
					try {
						learningJourneyRepository.delete(journey);
					} catch (Exception e) {
						// Log the error but continue with deletion
						System.err.println("Error deleting learning journey: " + e.getMessage());
					}
				}
			}
			
			// Remove this twit from any parent twit's reply list
			if (twit.getReplyFor() != null) {
				Twit parentTwit = twit.getReplyFor();
				parentTwit.getReplyTwits().remove(twit);
				twitRepository.save(parentTwit);
			}
			
			// Remove all replies to this twit
			if (twit.getReplyTwits() != null && !twit.getReplyTwits().isEmpty()) {
				for (Twit reply : twit.getReplyTwits()) {
					reply.setReplyFor(null);
					twitRepository.save(reply);
				}
				twit.getReplyTwits().clear();
				twitRepository.save(twit);
			}
			
			// Then delete the twit
			try {
				twitRepository.deleteById(twit.getId());
			} catch (Exception e) {
				throw new TwitException("Error deleting twit: " + e.getMessage());
			}
			
		} catch (Exception e) {
			throw new TwitException("Error deleting twit: " + e.getMessage());
		}
	}

	@Override
	public Twit removeFromRetwit(Long twitId, User user) throws TwitException, UserException {
		
		Twit twit=findById(twitId);
	
		twit.getRetwitUser().remove(user);
		
		return twitRepository.save(twit);
	}

	@Override
	public Twit createReply(TwitReplyRequest req,User user) throws TwitException {
		Twit twit = findById(req.getTwitId());
		
		Twit reply = new Twit();
		reply.setContent(req.getContent());
		reply.setCreatedAt(LocalDateTime.now());
		reply.setImages(req.getImages() != null ? req.getImages() : new ArrayList<>());
		reply.setUser(user);
		reply.setReplyFor(twit);
		reply.setReply(true);
		reply.setTwit(false);
		
		Twit savedReply = twitRepository.save(reply);
		
		twit.getReplyTwits().add(savedReply);
		twitRepository.save(twit);
		return twit;
	}

	@Override
	@Transactional(readOnly = true)
	public List<Twit> findAllTwit() {
		List<Twit> twits = twitRepository.findAllByIsTwitTrueOrderByCreatedAtDesc();
		// Initialize collections for each twit
		for (Twit twit : twits) {
			twit.getLikes().size();
			twit.getReplyTwits().size();
			twit.getRetwitUser().size();
		}
		return twits;
	}

	@Override
	@Transactional(readOnly = true)
	public List<Twit> getVisiblePosts(User viewer) {
		List<Twit> twits = twitRepository.findVisiblePosts(viewer, viewer.getFollowings());
		// Initialize collections for each twit
		for (Twit twit : twits) {
			twit.getLikes().size();
			twit.getReplyTwits().size();
			twit.getRetwitUser().size();
		}
		return twits;
	}

	@Override
	@Transactional(readOnly = true)
	public List<Twit> getUsersTwit(User user) {
		List<Twit> twits = twitRepository.findByRetwitUserContainsOrUser_IdAndIsTwitTrueOrderByCreatedAtDesc(user, user.getId());
		// Initialize collections for each twit
		for (Twit twit : twits) {
			twit.getLikes().size();
			twit.getReplyTwits().size();
			twit.getRetwitUser().size();
		}
		return twits;
	}

	@Override
	@Transactional(readOnly = true)
	public List<Twit> findByLikesContainsUser(User user) {
		List<Twit> twits = twitRepository.findByLikesUser_Id(user.getId());
		// Initialize collections for each twit
		for (Twit twit : twits) {
			twit.getLikes().size();
			twit.getReplyTwits().size();
			twit.getRetwitUser().size();
		}
		return twits;
	}
	
	@Override
	@Transactional
	public Twit updateTwit(Long twitId, String content, String images, String video, String videoDuration, User user) throws TwitException, UserException {
		try {
			Twit twit = findById(twitId);
			
			if (!twit.getUser().getId().equals(user.getId())) {
				throw new UserException("You can't update another user's twit");
			}

			if (content != null) {
				twit.setContent(content);
			}
			
			// Handle images update
			if (images != null) {
				try {
					// Parse the JSON array of images
					List<String> imageList = new ObjectMapper().readValue(images, new TypeReference<List<String>>() {});
					
					// Clear existing images
					twit.getImages().clear();
					
					// Add new images
					if (imageList != null && !imageList.isEmpty()) {
						twit.getImages().addAll(imageList);
					}
				} catch (Exception e) {
					throw new TwitException("Error parsing images JSON: " + e.getMessage());
				}
			}
			
			// Handle video update
			if (video == null || video.isEmpty()) {
				twit.setVideo(null);
				twit.setVideoDuration(null);
			} else {
				twit.setVideo(video);
				if (videoDuration != null) {
					twit.setVideoDuration(videoDuration);
				}
			}
			
			return twitRepository.save(twit);
		} catch (Exception e) {
			throw new TwitException("Error updating twit: " + e.getMessage());
		}
	}
	
	@Override
	@Transactional
	public Twit removeImageFromTwit(Long twitId, String imageUrl) throws TwitException {
		Twit twit = findById(twitId);
		
		// Remove the image from the list
		if (twit.getImages() != null) {
			twit.getImages().remove(imageUrl);
			// Force a save to ensure the image is removed from the twit_images table
			twitRepository.save(twit);
		}
		
		return twit;
	}

}
