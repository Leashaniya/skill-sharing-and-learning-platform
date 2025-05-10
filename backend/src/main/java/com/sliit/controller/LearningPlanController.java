package com.sliit.controller;

import com.sliit.dto.LearningPlanDTO;
import com.sliit.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService service;
// Endpoint to create a new learning plan
    @PostMapping
    public LearningPlanDTO create(@RequestBody LearningPlanDTO dto) {
        return service.createPlan(dto);
    }
    @GetMapping("/{id}")
    public LearningPlanDTO getPlanById(@PathVariable Long id) {
        return service.getPlanById(id);
    }

    @PutMapping("/{id}")
    public LearningPlanDTO update(@PathVariable Long id, @RequestBody LearningPlanDTO dto) {
        return service.updatePlan(id, dto);
    }
    @GetMapping
    public List<LearningPlanDTO> getAllPlans() {
        return service.getAllPlans();  // ✅ NEW
    }

    @GetMapping("/user/{userId}")
    public List<LearningPlanDTO> getPlansByUser(@PathVariable Long userId) {
        return service.getPlansByUser(userId);
    }

    @GetMapping("/shared/user/{userId}")
    public List<LearningPlanDTO> getPlansSharedToUser(@PathVariable Long userId) {
        return service.getPlansSharedToUser(userId);  // ✅ NEW
    }

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id) {
        return service.deletePlan(id);
    }


    @GetMapping("/shared")
    public List<LearningPlanDTO> getSharedPlans() {
        return service.getSharedPlans();
    }

    @PostMapping("/{planId}/share")
    public LearningPlanDTO shareLearningPlan(
            @PathVariable Long planId,
            @RequestParam Long userId,
            @RequestParam String userName
    ) {
        return service.sharePlan(planId, userId, userName);
    }

    @DeleteMapping("/{planId}/unshare/{sharedUserId}")
    public LearningPlanDTO unshareLearningPlan(
            @PathVariable Long planId,
            @PathVariable Long sharedUserId
    ) {
        return service.unsharePlan(planId, sharedUserId);
    }
}
