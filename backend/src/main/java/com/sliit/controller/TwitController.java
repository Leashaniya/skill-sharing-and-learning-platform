package com.sliit.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.sliit.dto.TwitDto;
import com.sliit.dto.mapper.TwitDtoMapper;
import com.sliit.exception.TwitException;
import com.sliit.exception.UserException;
import com.sliit.model.Twit;
import com.sliit.model.User;
import com.sliit.request.TwitReplyRequest;
import com.sliit.response.ApiResponse;
import com.sliit.service.TwitService;
import com.sliit.service.UserService;
import com.sliit.service.CloudinaryService;
import com.sliit.service.NotificationService;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/twits")
@Tag(name="Twit Management", description = "Endpoints for managing twits")
public class TwitController {
	
	private TwitService twitService;
	private UserService userService;
	private CloudinaryService cloudinaryService;
	private NotificationService notificationService;
	
	public TwitController(TwitService twitService, UserService userService, CloudinaryService cloudinaryService, NotificationService notificationService) {
		this.twitService = twitService;
		this.userService = userService;
		this.cloudinaryService = cloudinaryService;
		this.notificationService = notificationService;
	}
	
	@PostMapping("/create")
	public ResponseEntity<TwitDto> createTwit(
			@RequestParam(value = "content", required = true) String content,
			@RequestParam(value = "images", required = false) List<String> images,
			@RequestParam(value = "video", required = false) String video,
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException, IOException {
		
		User user = userService.findUserProfileByJwt(jwt);
		
		Twit twit = new Twit();
		twit.setContent(content);
		twit.setCreatedAt(LocalDateTime.now());
		twit.setUser(user);
		
		// Set images if provided
		if (images != null && !images.isEmpty()) {
			twit.setImages(images);
		}
		
		// Set video URL if provided
		if (video != null && !video.isEmpty()) {
			twit.setVideo(video);
		}
		
		Twit createdTwit = twitService.createTwit(twit, user);
		TwitDto twitDto = TwitDtoMapper.toTwitDto(createdTwit, user);
		
		return new ResponseEntity<>(twitDto, HttpStatus.CREATED);
	}
	
	@PostMapping("/reply")
	public ResponseEntity<TwitDto> replyTwit(@RequestBody TwitReplyRequest req, 
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		User user = userService.findUserProfileByJwt(jwt);
		Twit twit = twitService.createReply(req, user);
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);

		// Create a notification for the user being replied to
		notificationService.createCommentNotification(user, twit.getUser(), req.getContent());

		return new ResponseEntity<>(twitDto, HttpStatus.CREATED);
	}
	
	@PutMapping("/{twitId}/retwit")
	public ResponseEntity<TwitDto> retwit(@PathVariable Long twitId,
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		User user = userService.findUserProfileByJwt(jwt);
		Twit twit = twitService.retwit(twitId, user);
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);
		return new ResponseEntity<>(twitDto, HttpStatus.OK);
	}
	
	@GetMapping("/{twitId}")
	public ResponseEntity<TwitDto> findTwitById(@PathVariable Long twitId,
			@RequestHeader("Authorization") String jwt) throws TwitException, UserException {
		User user = userService.findUserProfileByJwt(jwt);
		Twit twit = twitService.findById(twitId);
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);
		return new ResponseEntity<>(twitDto, HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/{twitId}/details")
	public ResponseEntity<TwitDto> getTwitDetails(@PathVariable Long twitId,
			@RequestHeader("Authorization") String jwt) throws TwitException, UserException {
		User user = userService.findUserProfileByJwt(jwt);
		Twit twit = twitService.findById(twitId);
		
		// Load likes and comments eagerly
		twit.getLikes().size(); // This forces Hibernate to load the likes
		twit.getReplyTwits().size(); // This forces Hibernate to load the comments
		
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);
		return new ResponseEntity<>(twitDto, HttpStatus.OK);
	}
	
	@DeleteMapping("/{twitId}")
	public ResponseEntity<ApiResponse> deleteTwitById(@PathVariable Long twitId,
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		User user = userService.findUserProfileByJwt(jwt);
		
		// Get the twit before deleting to access its image URLs
		Twit twit = twitService.findById(twitId);
		
		// Delete the twit from database
		twitService.deleteTwitById(twitId, user.getId());
		
		// Delete associated images from Cloudinary
		if (twit.getImages() != null && !twit.getImages().isEmpty()) {
			for (String image : twit.getImages()) {
				cloudinaryService.deleteImage(image);
			}
		}
		if (twit.getVideo() != null) {
			cloudinaryService.deleteImage(twit.getVideo());
		}
		
		ApiResponse res = new ApiResponse();
		res.setMessage("twit deleted successfully");
		res.setStatus(true);
		
		return new ResponseEntity<>(res, HttpStatus.OK);
	}
	
	@GetMapping("/")
	public ResponseEntity<List<TwitDto>> findAllTwits(@RequestHeader("Authorization") String jwt) throws UserException {
		User user = userService.findUserProfileByJwt(jwt);
		List<Twit> twits = twitService.getVisiblePosts(user);
		List<TwitDto> twitDtos = TwitDtoMapper.toTwitDtos(twits, user);
		return new ResponseEntity<>(twitDtos, HttpStatus.OK);
	}
	
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<TwitDto>> getUsersTwits(@PathVariable Long userId,
			@RequestHeader("Authorization") String jwt) throws UserException {
		User reqUser = userService.findUserProfileByJwt(jwt);
		User user = userService.findUserById(userId);
		
		// Only show posts if the viewer is the same user or follows the profile owner
		if (!reqUser.getId().equals(userId) && !reqUser.getFollowings().contains(user)) {
			return new ResponseEntity<>(new ArrayList<>(), HttpStatus.OK);
		}
		
		List<Twit> twits = twitService.getUsersTwit(user);
		List<TwitDto> twitDtos = TwitDtoMapper.toTwitDtos(twits, reqUser);
		return new ResponseEntity<>(twitDtos, HttpStatus.OK);
	}
	
	@GetMapping("/user/{userId}/likes")
	public ResponseEntity<List<TwitDto>> findTwitByLikesContainsUser(@PathVariable Long userId,
			@RequestHeader("Authorization") String jwt) throws UserException {
		User reqUser = userService.findUserProfileByJwt(jwt);
		User user = userService.findUserById(userId);
		List<Twit> twits = twitService.findByLikesContainsUser(user);
		List<TwitDto> twitDtos = TwitDtoMapper.toTwitDtos(twits, reqUser);
		return new ResponseEntity<>(twitDtos, HttpStatus.OK);
	}
	
	@PutMapping("/{twitId}")
	public ResponseEntity<TwitDto> updateTwit(
			@PathVariable Long twitId,
			@RequestParam(required = false) String content,
			@RequestParam(required = false) String images,
			@RequestParam(required = false) String video,
			@RequestParam(required = false) String videoDuration,
			@RequestHeader("Authorization") String jwt) throws Exception {
		
		User user = userService.findUserProfileByJwt(jwt);
		Twit updatedTwit = twitService.updateTwit(twitId, content, images, video, videoDuration, user);
		
		// Convert to DTO and return
		TwitDto twitDto = TwitDtoMapper.toTwitDto(updatedTwit, user);
		return new ResponseEntity<>(twitDto, HttpStatus.OK);
	}
	
	@DeleteMapping("/{twitId}/images")
	public ResponseEntity<TwitDto> removeImageFromTwit(
			@PathVariable Long twitId,
			@RequestParam("imageUrl") String imageUrl,
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		User user = userService.findUserProfileByJwt(jwt);
		Twit existingTwit = twitService.findById(twitId);
		
		if (!existingTwit.getUser().getId().equals(user.getId())) {
			throw new TwitException("You can only remove images from your own posts");
		}
		
		// Remove the image from the twit
		Twit updatedTwit = twitService.removeImageFromTwit(twitId, imageUrl);
		
		// Delete the image from Cloudinary
		try {
			cloudinaryService.deleteImage(imageUrl);
		} catch (Exception e) {
			// Log the error but don't fail the request
			System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
		}
		
		TwitDto twitDto = TwitDtoMapper.toTwitDto(updatedTwit, user);
		return new ResponseEntity<>(twitDto, HttpStatus.OK);
	}
}
