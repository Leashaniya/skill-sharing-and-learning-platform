package com.sliit.repository;

import com.sliit.model.SharedPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SharedPlanRepository extends JpaRepository<SharedPlan, Long> {
    boolean existsByLearningPlanIdAndUserId(Long learningPlanId, Long userId);

    Optional<SharedPlan> findByLearningPlanIdAndUserId(Long learningPlanId, Long userId);

    long countByLearningPlanId(Long learningPlanId);

    List<SharedPlan> findByUserId(Long userId);

    List<SharedPlan> findByLearningPlanId(Long learningPlanId);

}
