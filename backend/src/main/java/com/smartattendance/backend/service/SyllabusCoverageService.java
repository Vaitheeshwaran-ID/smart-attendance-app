package com.smartattendance.backend.service;

import com.smartattendance.backend.model.SyllabusCoverage;
import com.smartattendance.backend.model.User;
import com.smartattendance.backend.repository.SyllabusCoverageRepository;
import com.smartattendance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class SyllabusCoverageService {

    @Autowired
    private SyllabusCoverageRepository coverageRepository;

    @Autowired
    private UserRepository userRepository;

    // Faculty submits syllabus coverage
    public Map<String, String> submitCoverage(
            Map<String, String> request) {
        Map<String, String> response = new HashMap<>();

        String facultyEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        SyllabusCoverage coverage = new SyllabusCoverage();
        coverage.setSubject(request.get("subject"));
        coverage.setDepartment(request.get("department"));
        coverage.setSection(request.get("section"));
        coverage.setFacultyEmail(facultyEmail);
        coverage.setUnitNumber(request.get("unitNumber"));
        coverage.setTopicCovered(request.get("topicCovered"));
        coverage.setDate(LocalDate.now());
        coverage.setTimePeriod(request.get("timePeriod"));
        coverage.setDescription(request.get("description"));
        coverage.setStatus(SyllabusCoverage.Status.valueOf(
            request.getOrDefault("status", "COMPLETED")));

        coverageRepository.save(coverage);
        response.put("message", "Syllabus coverage submitted!");
        return response;
    }

    // Get coverage by subject (for students)
    public List<SyllabusCoverage> getCoverageBySubject(
            String subject, String department) {
        return coverageRepository
            .findBySubjectAndDepartment(subject, department);
    }

    // Get today's coverage for a department
    public List<SyllabusCoverage> getTodayCoverage(
            String department) {
        return coverageRepository
            .findByDateAndDepartment(LocalDate.now(), department);
    }

    // Get all coverage by faculty
    public List<SyllabusCoverage> getFacultyCoverage() {
        String facultyEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return coverageRepository.findByFacultyEmail(facultyEmail);
    }

    // Get coverage for section (for advisor/student)
    public List<SyllabusCoverage> getSectionCoverage(
            String department, String section) {
        return coverageRepository
            .findByDepartmentAndSection(department, section);
    }
}