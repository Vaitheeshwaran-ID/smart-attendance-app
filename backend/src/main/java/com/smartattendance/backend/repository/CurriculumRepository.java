package com.smartattendance.backend.repository;

import com.smartattendance.backend.model.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {
    List<Curriculum> findBySubject(String subject);
    List<Curriculum> findByDepartment(String department);
    List<Curriculum> findBySubjectAndDepartment(String subject, String department);
}