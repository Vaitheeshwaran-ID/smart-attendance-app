package com.smartattendance.backend.repository;

import com.smartattendance.backend.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableRepository
        extends JpaRepository<Timetable, Long> {

    List<Timetable> findByDepartment(String department);
    List<Timetable> findByFacultyEmail(String facultyEmail);
    List<Timetable> findByDay(String day);
    List<Timetable> findByDepartmentAndDay(
        String department, String day);
    List<Timetable> findByDepartmentAndSection(
        String department, String section);
    List<Timetable> findByDepartmentAndSectionAndDay(
        String department, String section, String day);
}