package com.smartattendance.backend.controller;

import com.smartattendance.backend.dto.CurriculumRequest;
import com.smartattendance.backend.model.Curriculum;
import com.smartattendance.backend.service.CurriculumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/curriculum")
@CrossOrigin(origins = "*")
public class CurriculumController {

    @Autowired
    private CurriculumService curriculumService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> create(
            @RequestBody CurriculumRequest request) {
        return ResponseEntity.ok(
            curriculumService.createCurriculum(request));
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Curriculum>> getBySubject(
            @PathVariable String subject) {
        return ResponseEntity.ok(
            curriculumService.getBySubject(subject));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Curriculum>> getByDepartment(
            @PathVariable String department) {
        return ResponseEntity.ok(
            curriculumService.getByDepartment(department));
    }

    @PutMapping("/complete/{id}")
    public ResponseEntity<Map<String, String>> markCompleted(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            curriculumService.markCompleted(id));
    }
}