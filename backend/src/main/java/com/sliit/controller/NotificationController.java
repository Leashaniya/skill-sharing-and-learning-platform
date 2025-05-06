package com.sliit.controller;

import com.sliit.exception.UserException;
import com.sliit.model.Notification;
import com.sliit.model.User;
import com.sliit.service.NotificationService;
import com.sliit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("Authorization") String jwt) throws UserException {
        User loggedInUser = userService.findUserProfileByJwt(jwt);

        List<Notification> notifications = notificationService.getNotificationsForUser(loggedInUser);

        return ResponseEntity.ok(notifications);
    }
}
