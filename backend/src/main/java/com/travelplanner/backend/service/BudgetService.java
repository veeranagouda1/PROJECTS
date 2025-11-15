package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.model.Budget;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.BudgetRepository;
import com.travelplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Budget> getUserBudgets(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return budgetRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Budget createBudget(Budget budget, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        budget.setUser(user);
        budget.setCreatedAt(LocalDateTime.now());
        budget.setUpdatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long budgetId, Budget budgetDetails, Long userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        budget.setCategory(budgetDetails.getCategory());
        budget.setAmount(budgetDetails.getAmount());
        budget.setDescription(budgetDetails.getDescription());
        budget.setTrip(budgetDetails.getTrip());
        budget.setUpdatedAt(LocalDateTime.now());

        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        budgetRepository.delete(budget);
    }
}

