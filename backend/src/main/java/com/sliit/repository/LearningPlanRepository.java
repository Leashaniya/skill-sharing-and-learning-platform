package com.sliit.repository;

import com.sliit.model.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// This is the repository interface for LearningPlan, extending JpaRepository to provide CRUD operations
// on the LearningPlan entity. JpaRepository offers standard methods like save, findById, delete, 
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUserId(Long userId);
    List<LearningPlan> findByIsSharedTrue();
}
