package com.sliit.repository;


import com.sliit.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}
