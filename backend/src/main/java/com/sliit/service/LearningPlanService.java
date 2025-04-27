package com.sliit.service;

import com.sliit.dto.LearningPlanDTO;
import com.sliit.dto.SharedPlanDTO;
import com.sliit.model.LearningPlan;
import com.sliit.model.SharedPlan;
import com.sliit.repository.LearningPlanRepository;
import com.sliit.repository.SharedPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private SharedPlanRepository sharedPlanRepository;
    public LearningPlanDTO getPlanById(Long id) {
        LearningPlan plan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning Plan not found"));
        return mapToDTO(plan);
    }

    public LearningPlanDTO createPlan(LearningPlanDTO dto) {
        LearningPlan plan = mapToEntity(dto);
        LearningPlan saved = learningPlanRepository.save(plan);
        return mapToDTO(saved);
    }
    public List<LearningPlanDTO> getAllPlans() {
        return learningPlanRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LearningPlanDTO> getPlansSharedToUser(Long userId) {
        List<SharedPlan> sharedPlans = sharedPlanRepository.findByUserId(userId);

        return sharedPlans.stream()
                .map(sp -> mapToDTO(sp.getLearningPlan()))
                .collect(Collectors.toList());
    }

    public LearningPlanDTO updatePlan(Long id, LearningPlanDTO dto) {
        Optional<LearningPlan> opt = learningPlanRepository.findById(id);
        if (opt.isEmpty()) return null;

        LearningPlan plan = opt.get();
        plan.setTitle(dto.getTitle());
        plan.setDescription(dto.getDescription());
        plan.setTopics(dto.getTopics());
        plan.setResources(dto.getResources());
        plan.setDeadline(dto.getDeadline());

        LearningPlan updated = learningPlanRepository.save(plan);
        return mapToDTO(updated);
    }

    public boolean deletePlan(Long id) {
        if (!learningPlanRepository.existsById(id)) return false;
        learningPlanRepository.deleteById(id);
        return true;
    }

    public List<LearningPlanDTO> getPlansByUser(Long userId) {
        return learningPlanRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LearningPlanDTO> getSharedPlans() {
        return learningPlanRepository.findByIsSharedTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public LearningPlanDTO sharePlan(Long planId, Long userId, String userName) {
        LearningPlan plan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning Plan not found"));

//        // Check if already shared
//        boolean alreadyShared = sharedPlanRepository.existsByLearningPlanIdAndUserId(planId, userId);
//        if (alreadyShared) {
//            throw new RuntimeException("User already shared this plan!");
//        }

        SharedPlan sharedPlan = new SharedPlan(plan, userId, userName);
        sharedPlanRepository.save(sharedPlan);

        plan.setShared(true);
        learningPlanRepository.save(plan);

        return mapToDTO(plan);
    }

    public LearningPlanDTO unsharePlan(Long planId, Long sharedUserId) {
        SharedPlan sharedPlan = sharedPlanRepository.findByLearningPlanIdAndUserId(planId, sharedUserId)
                .orElseThrow(() -> new RuntimeException("Shared user not found"));

        sharedPlanRepository.delete(sharedPlan);

        long remainingShares = sharedPlanRepository.countByLearningPlanId(planId);
        if (remainingShares == 0) {
            LearningPlan plan = learningPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));
            plan.setShared(false);
            learningPlanRepository.save(plan);
        }

        LearningPlan plan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        return mapToDTO(plan);
    }

    private LearningPlan mapToEntity(LearningPlanDTO dto) {
        boolean isShared = dto.getSharedPlans() != null && !dto.getSharedPlans().isEmpty();

        return new LearningPlan(
                dto.getUserId(),
                dto.getTitle(),
                dto.getDescription(),
                dto.getTopics(),
                dto.getResources(),
                dto.getDeadline(),
                isShared
        );
    }


    private LearningPlanDTO mapToDTO(LearningPlan plan) {
        LearningPlanDTO dto = new LearningPlanDTO();
        dto.setId(plan.getId());
        dto.setUserId(plan.getUserId());
        dto.setTitle(plan.getTitle());
        dto.setDescription(plan.getDescription());
        dto.setTopics(plan.getTopics());
        dto.setResources(plan.getResources());
        dto.setDeadline(plan.getDeadline());

        List<SharedPlanDTO> sharedUsers = sharedPlanRepository.findByLearningPlanId(plan.getId())
                .stream()
                .map(sp -> new SharedPlanDTO(sp.getId(), sp.getUserId(), sp.getUserName()))
                .collect(Collectors.toList());

        dto.setSharedPlans(sharedUsers);

        return dto;
    }
}
