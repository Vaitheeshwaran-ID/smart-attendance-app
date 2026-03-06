package com.smartattendance.backend.repository;

import com.smartattendance.backend.model.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClassSessionRepository
        extends JpaRepository<ClassSession, Long> {
    Optional<ClassSession> findByQrToken(String qrToken);
    List<ClassSession> findByFacultyEmail(String facultyEmail);
    List<ClassSession> findByDepartment(String department);
    List<ClassSession> findBySubjectAndDepartment(
        String subject, String department);
}