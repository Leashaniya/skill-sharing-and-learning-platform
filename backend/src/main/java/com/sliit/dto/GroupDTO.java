package com.sliit.dto;

import com.sliit.model.GroupUser;
import java.util.List;

public class GroupDTO {
    private Long id;
    private String name;
    private String description;
    private String groupImage;
    private Boolean isPublic;
    private Long ownerId;

    public GroupDTO() {}

    public GroupDTO(Long id, String name, String description, String groupImage, Boolean isPublic,  Long ownerId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.groupImage = groupImage;
        this.isPublic = isPublic;
        this.ownerId = ownerId;
    }



    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGroupImage() { return groupImage; }
    public void setGroupImage(String groupImage) { this.groupImage = groupImage; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }


    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}
