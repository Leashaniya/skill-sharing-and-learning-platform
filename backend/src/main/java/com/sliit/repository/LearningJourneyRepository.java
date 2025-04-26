package com.sliit.repository;

import com.sliit.model.LearningJourney;
import com.sliit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LearningJourneyRepository extends JpaRepository<LearningJourney, Long> {
    @Query("SELECT l FROM LearningJourney l WHERE l.user.id = :userId ORDER BY l.createdAt DESC")
    List<LearningJourney> findByUserId(@Param("userId") Long userId);

    @Query("SELECT l FROM LearningJourney l WHERE l.post.id = :postId")
    List<LearningJourney> findByPostId(@Param("postId") Long postId);
} 