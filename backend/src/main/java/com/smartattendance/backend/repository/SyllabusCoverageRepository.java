package com.smartattendance.backend.repository;

import com.smartattendance.backend.model.SyllabusCoverage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SyllabusCoverageRepository
        extends JpaRepository<SyllabusCoverage, Long> {

    List<SyllabusCoverage> findBySubjectAndDepartment(
        String subject, String department);

    List<SyllabusCoverage> findByFacultyEmail(
        String facultyEmail);

    List<SyllabusCoverage> findByDepartmentAndSection(
        String department, String section);

    List<SyllabusCoverage> findByDateAndDepartment(
        LocalDate date, String department);

    List<SyllabusCoverage> findBySubjectAndDepartmentAndSection(
        String subject, String department, String section);
}