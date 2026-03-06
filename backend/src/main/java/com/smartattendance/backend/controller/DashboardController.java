package com.smartattendance.backend.controller;

import com.smartattendance.backend.repository.AttendanceRepository;
import com.smartattendance.backend.repository.ClassSessionRepository;
import com.smartattendance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassSessionRepository sessionRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers",
            userRepository.count());
        stats.put("totalSessions",
            sessionRepository.count());
        stats.put("totalAttendanceRecords",
            attendanceRepository.count());

        return ResponseEntity.ok(stats);
    }
}