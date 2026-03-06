package com.smartattendance.backend.controller;

import com.smartattendance.backend.model.Timetable;
import com.smartattendance.backend.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "*")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    // Create slot
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> create(
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
            timetableService.createTimetable(request));
    }

    // Get weekly timetable for section
    @GetMapping("/weekly/{department}/{section}")
    public ResponseEntity<Map<String, List<Timetable>>>
            getWeekly(
            @PathVariable String department,
            @PathVariable String section) {
        return ResponseEntity.ok(
            timetableService.getWeeklyTimetable(
                department, section));
    }

    // Get faculty timetable
    @GetMapping("/faculty")
    public ResponseEntity<Map<String, List<Timetable>>>
            getFacultyTimetable() {
        return ResponseEntity.ok(
            timetableService.getFacultyTimetable());
    }

    // Delete slot
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            timetableService.deleteSlot(id));
    }
}