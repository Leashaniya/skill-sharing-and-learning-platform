package com.sliit.repository;


import com.sliit.model.GroupUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupUserRepository extends JpaRepository<GroupUser, Long> {
    List<GroupUser> findByGroupId(Long groupId);
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

}
