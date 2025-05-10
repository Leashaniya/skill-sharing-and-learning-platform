package com.sliit.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sliit.model.Notification;
import com.sliit.model.Twit;
import com.sliit.model.User;
import com.sliit.repository.NotificationRepository;
import com.sliit.request.TwitReplyRequest;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserService userService;

    public void createFollowNotification(User from, User to) {

        Notification notification = new Notification();
        notification.setType("follow");
        notification.setTimestamp(new Date());
        notification.setIsRead(false);
        notification.setFrom(from);
        notification.setTo(to);

        notificationRepository.save(notification);
    }

    public void createLikeNotification(User from, User to, Twit post) {

        Notification notification = new Notification();
        notification.setType("like");
        notification.setTimestamp(new Date());
        notification.setIsRead(false);
        notification.setFrom(from);
        notification.setTo(to);
        notification.setPost(post);

        notificationRepository.save(notification);
    }

    public void createCommentNotification(User from, User to, String comment) {

        Notification notification = new Notification();
        notification.setType("comment");
        notification.setTimestamp(new Date());
        notification.setIsRead(false);
        notification.setFrom(from);
        notification.setTo(to);
        notification.setComment(comment);

        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByTo(user);
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }
}
