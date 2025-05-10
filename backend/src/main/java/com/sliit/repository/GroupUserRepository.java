package com.sliit.repository;

import com.sliit.model.GroupUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupUserRepository extends JpaRepository<GroupUser, Long> {

    // Find all users in a group by group ID with pagination support
    Page<GroupUser> findByGroupId(Long groupId, Pageable pageable);

    // Check if a user is a member of a group by group ID and user ID
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    // Find all users for a specific group by group ID (returns Optional)
    Optional<List<GroupUser>> findByGroupId(Long groupId);

    // Additional query: Find all groups a user is part of
    List<GroupUser> findByUserId(Long userId);
}
