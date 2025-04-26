package com.sliit.service;

import java.util.List;

import com.sliit.exception.TwitException;
import com.sliit.exception.UserException;
import com.sliit.model.Twit;
import com.sliit.model.User;
import com.sliit.request.TwitReplyRequest;
import com.sliit.request.TwitRequest;

public interface TwitService {
	
	
	public Twit createTwit(Twit req,User user)throws UserException, TwitException;
	
	public List<Twit> findAllTwit();
	
	public List<Twit> getVisiblePosts(User viewer);
	
	public Twit retwit(Long twitId, User user) throws UserException, TwitException;
	
	public Twit findById(Long twitId) throws TwitException;
	
	public void deleteTwitById(Long twitId,Long userId) throws TwitException, UserException;
	
	public Twit removeFromRetwit(Long twitId, User user) throws TwitException, UserException;
	
	public Twit createReply(TwitReplyRequest req,User user) throws TwitException;
	
	public List<Twit> getUsersTwit(User user);
	
	public List<Twit> findByLikesContainsUser(User user);
	
	public Twit updateTwit(Long twitId, String content, String images, String video, String videoDuration, User user) throws TwitException, UserException;
	
	public Twit removeImageFromTwit(Long twitId, String imageUrl) throws TwitException;
	

}
