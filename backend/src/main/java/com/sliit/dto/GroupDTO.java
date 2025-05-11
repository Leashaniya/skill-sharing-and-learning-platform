package com.sliit.dto;

import com.sliit.model.GroupUser;
import java.util.List;

/**
 * Data Transfer Object representing a Group entity.
 * Used to transfer group data between the controller, service, and other layers.
 */


public class GroupDTO {
    private Long id;    /** Unique identifier for the group */
    private String name; /** Name of the group */
    private String description; /** Description of the group */
    private String groupImage;  /** Image URL or path representing the group */
    private Boolean isPublic;   /** Indicates whether the group is public or private */
    private Long ownerId; /** ID of the user who owns the group */

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
