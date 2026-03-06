package com.smartattendance.backend.controller;

import com.smartattendance.backend.model.SyllabusCoverage;
import com.smartattendance.backend.service.SyllabusCoverageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/syllabus")
@CrossOrigin(origins = "*")
public class SyllabusCoverageController {

    @Autowired
    private SyllabusCoverageService coverageService;

    // Faculty submits coverage
    @PostMapping("/submit")
    public ResponseEntity<Map<String, String>> submitCoverage(
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
            coverageService.submitCoverage(request));
    }

    // Get by subject
    @GetMapping("/subject/{subject}/{department}")
    public ResponseEntity<List<SyllabusCoverage>> getBySubject(
            @PathVariable String subject,
            @PathVariable String department) {
        return ResponseEntity.ok(
            coverageService.getCoverageBySubject(
                subject, department));
    }

    // Get today's coverage
    @GetMapping("/today/{department}")
    public ResponseEntity<List<SyllabusCoverage>> getToday(
            @PathVariable String department) {
        return ResponseEntity.ok(
            coverageService.getTodayCoverage(department));
    }

    // Get faculty's submissions
    @GetMapping("/faculty")
    public ResponseEntity<List<SyllabusCoverage>> getFaculty() {
        return ResponseEntity.ok(
            coverageService.getFacultyCoverage());
    }

    // Get section coverage
    @GetMapping("/section/{department}/{section}")
    public ResponseEntity<List<SyllabusCoverage>> getSection(
            @PathVariable String department,
            @PathVariable String section) {
        return ResponseEntity.ok(
            coverageService.getSectionCoverage(
                department, section));
    }
}