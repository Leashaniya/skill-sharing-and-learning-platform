package com.sliit.controller;

import com.sliit.exception.UserException;
import com.sliit.model.Notification;
import com.sliit.model.User;
import com.sliit.repository.NotificationRepository;
import com.sliit.service.NotificationService;
import com.sliit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("Authorization") String jwt)
            throws UserException {
        User loggedInUser = userService.findUserProfileByJwt(jwt);

        List<Notification> notifications = notificationService.getNotificationsForUser(loggedInUser);

        return ResponseEntity.ok(notifications);
    }

    @PutMapping("notifications/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {

        Optional<Notification> notificationOpt = notificationService.getNotificationById(id);

        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();

            notification.setIsRead(true);

            notificationRepository.save(notification);

            return ResponseEntity.ok(notification);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
