package com.sliit.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_plans")
public class LearningPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String title;
    private String description;
    private String topics;
    private String resources;
    private LocalDate deadline;
    private boolean isShared;

    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SharedPlan> sharedPlans = new ArrayList<>(); // ✅ new relation

    public LearningPlan() {
    }

    public LearningPlan(Long userId, String title, String description, String topics,
                        String resources, LocalDate deadline, boolean isShared) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.topics = topics;
        this.resources = resources;
        this.deadline = deadline;
        this.isShared = isShared;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTopics() { return topics; }
    public void setTopics(String topics) { this.topics = topics; }

    public String getResources() { return resources; }
    public void setResources(String resources) { this.resources = resources; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public boolean isShared() { return isShared; }
    public void setShared(boolean shared) { isShared = shared; }

    public List<SharedPlan> getSharedPlans() { return sharedPlans; }
    public void setSharedPlans(List<SharedPlan> sharedPlans) { this.sharedPlans = sharedPlans; }
}
