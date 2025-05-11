package com.sliit.controller;



import com.sliit.dto.GroupDTO;
import com.sliit.dto.GroupUserDTO;
import com.sliit.service.GroupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for managing groups and group members.
 */

@Slf4j
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupDTO groupDTO) {
        log.info("Received request: {}", groupDTO);
        return ResponseEntity.ok(groupService.createGroup(groupDTO));
    }

     /**
     * Retrieves a group by its ID.
     * @param id the ID of the group
     * @return the group if found, or 404 if not found
     */
    

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroup(@PathVariable Long id) {
        return groupService.getGroup(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

     /**
     * Retrieves all existing groups.
     * @return a list of all groups
     */

    @GetMapping
    public List<GroupDTO> getAllGroups() {
        return groupService.getAllGroups();
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDTO> updateGroup(@PathVariable Long id, @RequestBody GroupDTO updatedGroupDTO) {
        return ResponseEntity.ok(groupService.updateGroup(id, updatedGroupDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/users/{userId}")
    public ResponseEntity<GroupUserDTO> addUserToGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        return ResponseEntity.ok(groupService.addUserToGroup(groupId, userId));
    }


      /**
     * Retrieves all users in a specific group.
     * @param groupId the ID of the group
     * @return a list of users in the group
     */

    @GetMapping("/{groupId}/users")
    public ResponseEntity<List<GroupUserDTO>> getUsersInGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getUsersInGroup(groupId));
    }
}