package com.smartattendance.backend.controller;

import com.smartattendance.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Student sees own report
    @GetMapping("/student")
    public ResponseEntity<Map<String, Object>> studentReport() {
        return ResponseEntity.ok(
            reportService.getStudentReport());
    }

    // Faculty sees own report
    @GetMapping("/faculty")
    public ResponseEntity<Map<String, Object>> facultyReport() {
        return ResponseEntity.ok(
            reportService.getFacultyReport());
    }

    // Admin sees department report
    @GetMapping("/admin/{department}")
    public ResponseEntity<Map<String, Object>> adminReport(
            @PathVariable String department) {
        return ResponseEntity.ok(
            reportService.getAdminReport(department));
    }
}