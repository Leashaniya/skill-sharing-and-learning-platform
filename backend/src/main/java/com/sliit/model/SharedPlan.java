package com.sliit.model;

import jakarta.persistence.*;

@Entity
@Table(name = "shared_plans")
public class SharedPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_plan_id")
    private LearningPlan learningPlan; // ✅

    public SharedPlan() {}

    // ✅ Accept LearningPlan object
    public SharedPlan(LearningPlan learningPlan, Long userId, String userName) {
        this.learningPlan = learningPlan;
        this.userId = userId;
        this.userName = userName;
    }

    // Getters and Setters
    
