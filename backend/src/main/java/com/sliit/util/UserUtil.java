package com.sliit.util;

import java.time.LocalDateTime;

import com.sliit.model.User;

public class UserUtil {
	
	
	public static final boolean isReqUser(User reqUser,User user2) {
		return reqUser.getId().equals(user2.getId());
	}
	
	public static final boolean isFollowedByReqUser(User reqUser , User user2) {
		return reqUser.getFollowings().contains(user2);
		
	}
	
	public static final boolean isVerified(LocalDateTime endsDate) {
		if(endsDate!=null)
			return endsDate.isAfter(LocalDateTime.now());
		else
			return false;
	}

}
