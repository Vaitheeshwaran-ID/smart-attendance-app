package com.smartattendance.backend.controller;

import com.smartattendance.backend.dto.RegisterRequest;
import com.smartattendance.backend.service.AdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
@CrossOrigin(origins = "*")
public class AdvisorController {

    @Autowired
    private AdvisorService advisorService;

    // Create student account
    @PostMapping("/create-student")
    public ResponseEntity<Map<String, String>> createStudent(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
            advisorService.createStudent(request));
    }

    // Get all students in section
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents() {
        return ResponseEntity.ok(
            advisorService.getSectionStudents());
    }

    // Get low attendance students
    @GetMapping("/students/low-attendance")
    public ResponseEntity<List<Map<String, Object>>> getLowAttendance() {
        return ResponseEntity.ok(
            advisorService.getLowAttendanceStudents());
    }

    // Get faculty report
    @GetMapping("/faculty-report")
    public ResponseEntity<List<Map<String, Object>>> getFacultyReport() {
        return ResponseEntity.ok(
            advisorService.getFacultyReport());
    }

    // Dashboard summary
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(
            advisorService.getDashboardSummary());
    }
// Remove student
@DeleteMapping("/remove-student/{email}")
public ResponseEntity<Map<String, String>> removeStudent(
        @PathVariable String email) {
    return ResponseEntity.ok(
        advisorService.removeStudent(email));
}

}