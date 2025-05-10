package com.sliit.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class NotificationDto {
    private Long id;
    private String type;
    private Date timestamp;
    private Boolean isRead;
    private Long fromUserId;
    private String fromUserFullName;
    private Long toUserId;
    private String toUserFullName;
    private Long postId;
    private String postContent;
}
