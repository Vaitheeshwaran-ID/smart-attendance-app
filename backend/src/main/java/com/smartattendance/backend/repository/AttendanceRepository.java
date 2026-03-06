package com.smartattendance.backend.repository;

import com.smartattendance.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentEmail(String studentEmail);
    List<Attendance> findByStudentEmailAndSubject(
        String studentEmail, String subject);
    List<Attendance> findBySession_Id(Long sessionId);
    long countByStudentEmailAndSubject(
        String studentEmail, String subject);
    boolean existsByStudentEmailAndSession_Id(
        String studentEmail, Long sessionId);
}