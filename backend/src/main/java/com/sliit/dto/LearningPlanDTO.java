package com.sliit.dto;

import java.time.LocalDate;
import java.util.List;

public class LearningPlanDTO {

    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String topics;
    private String resources;
    private LocalDate deadline;
    private List<SharedPlanDTO> sharedPlans; // ✅ new field

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

    public List<SharedPlanDTO> getSharedPlans() { return sharedPlans; }
    public void setSharedPlans(List<SharedPlanDTO> sharedPlans) { this.sharedPlans = sharedPlans; }
}
