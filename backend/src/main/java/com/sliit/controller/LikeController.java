package com.sliit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.dto.LikeDto;
import com.sliit.dto.TwitDto;
import com.sliit.dto.mapper.LikeDtoMapper;
import com.sliit.dto.mapper.TwitDtoMapper;
import com.sliit.exception.LikeException;
import com.sliit.exception.TwitException;
import com.sliit.exception.UserException;
import com.sliit.model.Like;
import com.sliit.model.Twit;
import com.sliit.model.User;
import com.sliit.service.LikesService;
import com.sliit.service.NotificationService;
import com.sliit.service.TwitService;
import com.sliit.service.UserService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api")
@Tag(name="Like-Unlike Twit")
public class LikeController {
	
	private UserService userService;
	private LikesService likeService;
	private NotificationService notificationService;
	private TwitService twitService;
	
	public LikeController(UserService userService,LikesService likeService, NotificationService notificationService, TwitService twitService) {
		this.userService=userService;
		this.likeService=likeService;
		this.notificationService = notificationService;
		this.twitService = twitService;
	}
	
	@PostMapping("/{twitId}/like")
	public ResponseEntity<LikeDto>likeTwit(
			@PathVariable Long twitId, 
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException{
		
		User user=userService.findUserProfileByJwt(jwt);
		Like like =likeService.likeTwit(twitId, user);
		
		LikeDto likeDto=LikeDtoMapper.toLikeDto(like,user);

		User from = user;
		Twit post = twitService.findById(twitId);
		User to = post.getUser();

		notificationService.createLikeNotification(from, to, post);
		
		return new ResponseEntity<>(likeDto,HttpStatus.CREATED);
	}
	@DeleteMapping("/{twitId}/unlike")
	public ResponseEntity<LikeDto>unlikeTwit(
			@PathVariable Long twitId, 
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException, LikeException{
		
		User user=userService.findUserProfileByJwt(jwt);
		Like like =likeService.unlikeTwit(twitId, user);
		
		
		LikeDto likeDto=LikeDtoMapper.toLikeDto(like,user);
		return new ResponseEntity<>(likeDto,HttpStatus.CREATED);
	}
	
	@GetMapping("likes/twit/{twitId}")
	public ResponseEntity<List<LikeDto>>getAllLike(
			@PathVariable Long twitId,@RequestHeader("Authorization") String jwt) throws UserException, TwitException{
		User user=userService.findUserProfileByJwt(jwt);
		
		List<Like> likes =likeService.getAllLikes(twitId);
		
		List<LikeDto> likeDtos=LikeDtoMapper.toLikeDtos(likes,user);
		
		return new ResponseEntity<>(likeDtos,HttpStatus.CREATED);
	}


}
