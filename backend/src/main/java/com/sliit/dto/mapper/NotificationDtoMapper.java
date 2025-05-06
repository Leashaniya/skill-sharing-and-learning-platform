package com.sliit.dto.mapper;

import com.sliit.model.Notification;
import com.sliit.dto.NotificationDto;
import com.sliit.model.User;
import com.sliit.model.Twit;
import org.springframework.stereotype.Component;

@Component
public class NotificationDtoMapper {

    public NotificationDto toDTO(Notification notification) {
        if (notification == null) {
            return null;
        }

        return new NotificationDto(
                notification.getId(),
                notification.getType(),
                notification.getTimestamp(),
                notification.getIsRead(),
                notification.getFrom() != null ? notification.getFrom().getId() : null,
                notification.getFrom() != null ? notification.getFrom().getFullName() : null,
                notification.getTo() != null ? notification.getTo().getId() : null,
                notification.getTo() != null ? notification.getTo().getFullName() : null,
                notification.getPost() != null ? notification.getPost().getId() : null,
                notification.getPost() != null ? notification.getPost().getContent() : null
        );
    }

    public Notification toEntity(NotificationDto NotificationDto) {
        if (NotificationDto == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setId(NotificationDto.getId());
        notification.setType(NotificationDto.getType());
        notification.setTimestamp(NotificationDto.getTimestamp());
        notification.setIsRead(NotificationDto.getIsRead());

        User fromUser = new User();
        fromUser.setId(NotificationDto.getFromUserId());
        fromUser.setFullName(NotificationDto.getFromUserFullName());
        notification.setFrom(fromUser);

        User toUser = new User();
        toUser.setId(NotificationDto.getToUserId());
        toUser.setFullName(NotificationDto.getToUserFullName());
        notification.setTo(toUser);

        if (NotificationDto.getPostId() != null) {
            Twit post = new Twit();
            post.setId(NotificationDto.getPostId());
            notification.setPost(post);
        }

        return notification;
    }
}
