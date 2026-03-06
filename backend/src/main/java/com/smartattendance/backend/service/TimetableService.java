package com.smartattendance.backend.service;

import com.smartattendance.backend.model.Timetable;
import com.smartattendance.backend.repository.TimetableRepository;
import com.smartattendance.backend.repository.UserRepository;
import com.smartattendance.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TimetableService {

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private UserRepository userRepository;

    // Create timetable slot
    public Map<String, String> createTimetable(
            Map<String, String> request) {
        Map<String, String> response = new HashMap<>();

        String facultyEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User faculty = userRepository
                .findByEmail(facultyEmail).orElse(null);

        Timetable timetable = new Timetable();
        timetable.setSubject(request.get("subject"));
        timetable.setFacultyEmail(facultyEmail);
        timetable.setFacultyName(
            faculty != null ? faculty.getName() : facultyEmail);
        timetable.setDay(request.get("day"));
        timetable.setStartTime(request.get("startTime"));
        timetable.setEndTime(request.get("endTime"));
        timetable.setDepartment(request.get("department"));
        timetable.setSection(request.get("section"));
        timetable.setRoom(request.getOrDefault("room", "TBD"));

        timetableRepository.save(timetable);
        response.put("message", "Timetable slot added!");
        return response;
    }

    // Get weekly timetable for a section
    public Map<String, List<Timetable>> getWeeklyTimetable(
            String department, String section) {

        List<String> days = Arrays.asList(
            "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday");

        Map<String, List<Timetable>> weekly = new LinkedHashMap<>();

        for (String day : days) {
            List<Timetable> slots = timetableRepository
                .findByDepartmentAndSectionAndDay(
                    department, section, day);
            // Sort by start time
            slots.sort(Comparator.comparing(
                Timetable::getStartTime));
            weekly.put(day, slots);
        }

        return weekly;
    }

    // Get faculty timetable
    public Map<String, List<Timetable>> getFacultyTimetable() {
        String facultyEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        List<String> days = Arrays.asList(
            "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday");

        Map<String, List<Timetable>> weekly = new LinkedHashMap<>();

        for (String day : days) {
            List<Timetable> slots = timetableRepository
                .findByFacultyEmail(facultyEmail)
                .stream()
                .filter(t -> t.getDay().equals(day))
                .sorted(Comparator.comparing(Timetable::getStartTime))
                .collect(java.util.stream.Collectors.toList());
            weekly.put(day, slots);
        }

        return weekly;
    }

    // Delete timetable slot
    public Map<String, String> deleteSlot(Long id) {
        Map<String, String> response = new HashMap<>();
        timetableRepository.deleteById(id);
        response.put("message", "Slot deleted!");
        return response;
    }
}