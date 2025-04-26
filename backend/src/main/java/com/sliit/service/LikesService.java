package com.sliit.service;

import java.util.List;

import com.sliit.exception.LikeException;
import com.sliit.exception.TwitException;
import com.sliit.exception.UserException;
import com.sliit.model.Like;
import com.sliit.model.Twit;
import com.sliit.model.User;

public interface LikesService {
	
	public Like likeTwit(Long twitId, User user) throws UserException, TwitException;
	
	public Like unlikeTwit(Long twitId, User user) throws UserException, TwitException, LikeException;
	
	public List<Like> getAllLikes(Long twitId) throws TwitException;

}
