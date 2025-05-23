package com.sliit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.dto.UserDto;
import com.sliit.dto.mapper.UserDtoMapper;
import com.sliit.exception.UserException;
import com.sliit.model.User;
import com.sliit.service.NotificationService;
import com.sliit.service.UserService;
import com.sliit.util.UserUtil;
import com.sliit.dto.ApiResponseDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/users")
@Tag(name="User Management", description = "Endpoints for managing user profiles and information")
public class UserController {

private UserService userService;
private NotificationService notificationService;
	
	public UserController(UserService userService, NotificationService notificationService) {
		this.userService=userService;
		this.notificationService=notificationService;
	}
	
	@GetMapping("/profile")
	 @Operation(
	            summary = "Get user profile details",
	            description = "REST API to fetch user's profile details based on a jwt"
	    )
	public ResponseEntity<UserDto> getUserProfileHandler(@RequestHeader("Authorization") String jwt) 
			throws UserException{

		User user=userService.findUserProfileByJwt(jwt);
		user.setPassword(null);
		user.setReq_user(true);
		UserDto userDto=UserDtoMapper.toUserDto(user);
		userDto.setReq_user(true);
		return new ResponseEntity<>(userDto,HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/{userId}")
	public ResponseEntity<UserDto> getUserByIdHandler(@PathVariable Long userId, 
			@RequestHeader("Authorization") String jwt) 
			throws UserException{
		
		User reqUser=userService.findUserProfileByJwt(jwt);
		
		User user=userService.findUserById(userId);
		
//		user.setReq_user(UserUtil.isReqUser(reqUser, user));
		
		UserDto userDto=UserDtoMapper.toUserDto(user);
		userDto.setReq_user(UserUtil.isReqUser(reqUser, user));
		userDto.setFollowed(UserUtil.isFollowedByReqUser(reqUser, user));
		return new ResponseEntity<>(userDto,HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/search")
	public ResponseEntity<List<UserDto>> searchUserHandler(@RequestParam String query, 
			@RequestHeader("Authorization") String jwt) 
			throws UserException{
		
		User reqUser=userService.findUserProfileByJwt(jwt);
		
		List<User> users=userService.searchUser(query);
		
//		user.setReq_user(UserUtil.isReqUser(reqUser, user));
		
		List<UserDto> userDtos=UserDtoMapper.toUserDtos(users);
		
		return new ResponseEntity<>(userDtos,HttpStatus.ACCEPTED);
	}
	
	@PutMapping("/update")
	public ResponseEntity<UserDto> updateUserHandler(@RequestBody User req, 
			@RequestHeader("Authorization") String jwt) 
			throws UserException{

		System.out.println("update user  "+req);
		User user=userService.findUserProfileByJwt(jwt);
		
		User updatedUser=userService.updateUser(user.getId(), req);
		updatedUser.setPassword(null);
		UserDto userDto=UserDtoMapper.toUserDto(user);
		userDto.setReq_user(true);
		return new ResponseEntity<>(userDto,HttpStatus.ACCEPTED);
	}
	
	@PutMapping("/{userId}/follow")
	public ResponseEntity<UserDto> followUserHandler(@PathVariable Long userId, @RequestHeader("Authorization") String jwt) 
			throws UserException{
		
		User user=userService.findUserProfileByJwt(jwt);
		
		User updatedUser=userService.followUser(userId, user);
		UserDto userDto=UserDtoMapper.toUserDto(updatedUser);
		userDto.setFollowed(UserUtil.isFollowedByReqUser(user, updatedUser));

		User from = user;
		User to = userService.findUserById(userId);

		notificationService.createFollowNotification(from, to);

		return new ResponseEntity<>(userDto,HttpStatus.ACCEPTED);
	}
	
	@DeleteMapping("/{userId}")
	public ResponseEntity<ApiResponseDto> deleteUser(
			@PathVariable Long userId,
			@RequestHeader("Authorization") String jwt) throws UserException {
		try {
			// Validate the requesting user
			User reqUser = userService.findUserProfileByJwt(jwt);
			
			// Check if the requesting user is trying to delete their own account
			if (!reqUser.getId().equals(userId)) {
				throw new UserException("You can only delete your own account");
			}
			
			// Delete the user
			userService.deleteUser(userId);
			
			// Return success response
			ApiResponseDto res = new ApiResponseDto("User deleted successfully", true);
			return new ResponseEntity<>(res, HttpStatus.OK);
		} catch (UserException e) {
			throw e;
		} catch (Exception e) {
			throw new UserException("Error deleting user: " + e.getMessage());
		}
	}
}
