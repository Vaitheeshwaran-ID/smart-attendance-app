package com.smartattendance.backend.repository;

import com.smartattendance.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByDepartmentAndRole(
        String department, User.Role role);
    List<User> findByDepartmentAndSectionAndRole(
        String department, String section, User.Role role);
}