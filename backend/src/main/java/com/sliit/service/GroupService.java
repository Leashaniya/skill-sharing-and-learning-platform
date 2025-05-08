package com.sliit.service;


import com.sliit.dto.GroupDTO;
import com.sliit.dto.GroupUserDTO;
import com.sliit.model.Group;
import com.sliit.model.GroupUser;
import com.sliit.repository.GroupRepository;
import com.sliit.repository.GroupUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private static final Logger log = LoggerFactory.getLogger(GroupService.class);
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupUserRepository groupUserRepository;

       /**
     * Create and persist a new group based on the provided DTO.
     */


    public GroupDTO createGroup(GroupDTO groupDTO) {
        Group group = new Group(groupDTO.getName(), groupDTO.getDescription(),groupDTO.getGroupImage(),groupDTO.getIsPublic(),groupDTO.getOwnerId());

        Group savedGroup = groupRepository.save(group);
        return new GroupDTO(savedGroup.getId(), savedGroup.getName(), savedGroup.getDescription(),savedGroup.getGroupImage(),savedGroup.getIsPublic(),savedGroup.getOwnerId());
    }

      /**
     * Retrieve a group by its ID and map it to GroupDTO.
     */

     
    public Optional<GroupDTO> getGroup(Long id) {
        return groupRepository.findById(id)
                .map(group -> new GroupDTO(group.getId(), group.getName(), group.getDescription(),group.getGroupImage(),group.getIsPublic(),group.getOwnerId()));
    }

    /**
     * Retrieve all groups and map them to a list of GroupDTOs.
     */

    public List<GroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(group -> new GroupDTO(group.getId(), group.getName(), group.getDescription(),group.getGroupImage(),group.getIsPublic(),group.getOwnerId()))
                .collect(Collectors.toList());
    }

    /**
     * Update an existing group's fields and return the updated DTO.
     */


    public GroupDTO updateGroup(Long id, GroupDTO updatedGroupDTO) {
        return groupRepository.findById(id).map(group -> {
            group.setName(updatedGroupDTO.getName());
            group.setDescription(updatedGroupDTO.getDescription());
            group.setGroupImage(updatedGroupDTO.getGroupImage());
            group.setIsPublic(updatedGroupDTO.getIsPublic());

            Group updatedGroup = groupRepository.save(group);

            return new GroupDTO(updatedGroup.getId(), updatedGroup.getName(), updatedGroup.getDescription(),updatedGroup.getGroupImage(),updatedGroup.getIsPublic(),updatedGroup.getOwnerId());
        }).orElseThrow(() -> new RuntimeException("Group not found"));
    }

     /**
     * Delete a group by its ID.
     */

    public void deleteGroup(Long id) {
        groupRepository.deleteById(id);
    }

    /**
     * Add a user to a group if not already added.
     */


    public GroupUserDTO addUserToGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
log.info(String.valueOf(groupId),userId);
        boolean alreadyJoined = groupUserRepository.existsByGroupIdAndUserId(groupId, userId);
        if (alreadyJoined) {
            throw new RuntimeException("User already joined this group!");
        }

        GroupUser groupUser = new GroupUser(group, userId);
        GroupUser savedGroupUser = groupUserRepository.save(groupUser);

        return new GroupUserDTO(savedGroupUser.getId(), savedGroupUser.getGroup().getId(), savedGroupUser.getUserId());
    }
 
    /**
     * Get a list of users associated with a specific group.
     */

    public List<GroupUserDTO> getUsersInGroup(Long groupId) {
        return groupUserRepository.findByGroupId(groupId).stream()
                .map(gu -> new GroupUserDTO(gu.getId(), gu.getGroup().getId(), gu.getUserId()))
                .collect(Collectors.toList());
    }
}