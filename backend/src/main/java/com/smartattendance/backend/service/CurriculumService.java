package com.smartattendance.backend.service;

import com.smartattendance.backend.dto.CurriculumRequest;
import com.smartattendance.backend.model.Curriculum;
import com.smartattendance.backend.repository.CurriculumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class CurriculumService {

    @Autowired
    private CurriculumRepository curriculumRepository;

    public Map<String, String> createCurriculum(CurriculumRequest request) {
        Map<String, String> response = new HashMap<>();

        Curriculum curriculum = new Curriculum();
        curriculum.setSubject(request.getSubject());
        curriculum.setDepartment(request.getDepartment());
        curriculum.setUnit(request.getUnit());
        curriculum.setTopic(request.getTopic());
        curriculum.setStatus(Curriculum.Status.PENDING);

        curriculumRepository.save(curriculum);

        response.put("message", "Curriculum topic added successfully!");
        return response;
    }

    public List<Curriculum> getBySubject(String subject) {
        return curriculumRepository.findBySubject(subject);
    }

    public List<Curriculum> getByDepartment(String department) {
        return curriculumRepository.findByDepartment(department);
    }

    public Map<String, String> markCompleted(Long id) {
        Map<String, String> response = new HashMap<>();

        Curriculum curriculum = curriculumRepository.findById(id)
                .orElse(null);

        if (curriculum == null) {
            response.put("error", "Topic not found!");
            return response;
        }

        curriculum.setStatus(Curriculum.Status.COMPLETED);
        curriculumRepository.save(curriculum);

        response.put("message", "Topic marked as completed!");
        return response;
    }
}