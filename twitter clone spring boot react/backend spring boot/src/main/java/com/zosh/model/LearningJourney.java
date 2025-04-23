package com.zosh.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "learning_journeys")
public class LearningJourney {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer estimatedDuration;
    private String skillLevel;

    @Enumerated(EnumType.STRING)
    private JourneyStatus status;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Twit post;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    public enum JourneyStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED
    }
} 