package com.sliit.model;


import jakarta.persistence.*;
import lombok.Getter;

import java.util.List;

@Getter
@Entity
@Table(name = "`groups`")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;
    private String groupImage;
    private Boolean isPublic;
    private Long ownerId;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupUser> groupUsers;

    public Group() {}

    public Group(String name, String description, String groupImage, Boolean isPublic,Long ownerId) {
        this.name = name;
        this.description = description;
        this.groupImage = groupImage;
        this.isPublic = isPublic;
        this.ownerId = ownerId;
    }

    public void setName(String name) { this.name = name; }

    public void setDescription(String description) { this.description = description; }

    public void setGroupUsers(List<GroupUser> groupUsers) { this.groupUsers = groupUsers; }

    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public void setGroupImage(String groupImage) { this.groupImage = groupImage; }

    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

}