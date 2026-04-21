package com.veerana.user_service.repository; // ✅ FIX: was 'Repository' (capital R) — breaks on Linux/Docker

import com.veerana.user_service.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
}