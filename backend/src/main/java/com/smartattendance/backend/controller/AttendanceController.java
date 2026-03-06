package com.smartattendance.backend.controller;

import com.smartattendance.backend.dto.MarkAttendanceRequest;
import com.smartattendance.backend.dto.StartClassRequest;
import com.smartattendance.backend.model.Attendance;
import com.smartattendance.backend.model.ClassSession;
import com.smartattendance.backend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // Faculty starts class
    @PostMapping("/start-class")
    public ResponseEntity<Map<String, Object>> startClass(
            @RequestBody StartClassRequest request) {
        return ResponseEntity.ok(
            attendanceService.startClass(request));
    }

    // Student marks attendance
    @PostMapping("/mark")
    public ResponseEntity<Map<String, String>> markAttendance(
            @RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(
            attendanceService.markAttendance(request));
    }

    // Get attendance for a session
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Attendance>> getSessionAttendance(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(
            attendanceService.getSessionAttendance(sessionId));
    }

    // Get student summary by subject
    @GetMapping("/summary/{subject}")
    public ResponseEntity<Map<String, Object>> getStudentSummary(
            @PathVariable String subject) {
        return ResponseEntity.ok(
            attendanceService.getStudentSummary(subject));
    }

    // Get faculty sessions
    @GetMapping("/faculty/sessions")
    public ResponseEntity<List<ClassSession>> getFacultySessions() {
        return ResponseEntity.ok(
            attendanceService.getFacultySessions());
    }
}