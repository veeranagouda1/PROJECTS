package com.travelplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.model.EmergencyContact;
import com.travelplanner.backend.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByUserOrderByIsPrimaryDesc(User user);
    Optional<EmergencyContact> findByUserAndIsPrimaryTrue(User user);
}

