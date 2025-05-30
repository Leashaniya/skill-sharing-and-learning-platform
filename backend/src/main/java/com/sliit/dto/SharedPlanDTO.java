package com.sliit.dto;

public class SharedPlanDTO {

    private Long id;
    private Long userId;
    private String userName;

    public SharedPlanDTO() {}

    public SharedPlanDTO(Long id, Long userId, String userName) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}
