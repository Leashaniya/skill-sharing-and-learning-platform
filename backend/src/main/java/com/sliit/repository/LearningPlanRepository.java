package com.sliit.repository;

import com.sliit.model.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUserId(Long userId);
    List<LearningPlan> findByIsSharedTrue();
}
