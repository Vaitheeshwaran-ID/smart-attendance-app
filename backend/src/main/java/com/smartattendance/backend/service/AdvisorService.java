package com.smartattendance.backend.service;

import com.smartattendance.backend.dto.RegisterRequest;
import com.smartattendance.backend.model.Attendance;
import com.smartattendance.backend.model.ClassSession;
import com.smartattendance.backend.model.User;
import com.smartattendance.backend.repository.AttendanceRepository;
import com.smartattendance.backend.repository.ClassSessionRepository;
import com.smartattendance.backend.repository.UserRepository;
import com.smartattendance.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdvisorService {

    @Autowired private UserRepository userRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private ClassSessionRepository sessionRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    // Get current advisor info
    private User getCurrentAdvisor() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    // Create student account (advisor can only create for their section)
    public Map<String, String> createStudent(RegisterRequest request) {
        Map<String, String> response = new HashMap<>();
        User advisor = getCurrentAdvisor();

        if (userRepository.existsByEmail(request.getEmail())) {
            response.put("error", "Email already registered!");
            return response;
        }

        // Force student into advisor's department & section
        User student = new User();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(User.Role.STUDENT);
        student.setDepartment(advisor.getDepartment());
        student.setSection(advisor.getSection());

        userRepository.save(student);
        response.put("message", "Student account created successfully!");
        return response;
    }

    // Get all students in advisor's section
    public List<Map<String, Object>> getSectionStudents() {
        User advisor = getCurrentAdvisor();
        List<User> allUsers = userRepository.findAll();

        List<Map<String, Object>> students = new ArrayList<>();
        for (User u : allUsers) {
            if (u.getRole() == User.Role.STUDENT
                    && advisor.getDepartment().equals(u.getDepartment())
                    && advisor.getSection() != null
                    && advisor.getSection().equals(u.getSection())) {

                List<Attendance> records =
                    attendanceRepository.findByStudentEmail(u.getEmail());

                // Group by subject
                Map<String, Integer> attended = new HashMap<>();
                for (Attendance a : records) {
                    attended.merge(a.getSubject(), 1, Integer::sum);
                }

                // Calculate overall %
                int totalAttended = records.size();
                List<ClassSession> allSessions = sessionRepository
                        .findByDepartment(advisor.getDepartment());
                int totalClasses = allSessions.size();
                double pct = totalClasses > 0
                        ? (totalAttended * 100.0 / totalClasses) : 0;

                Map<String, Object> studentData = new HashMap<>();
                studentData.put("name", u.getName());
                studentData.put("email", u.getEmail());
                studentData.put("section", u.getSection());
                studentData.put("totalAttended", totalAttended);
                studentData.put("totalClasses", totalClasses);
                studentData.put("overallPercentage",
                    Math.round(pct) + "%");
                studentData.put("status",
                    pct >= 75 ? "GOOD" : "LOW");
                studentData.put("subjectWise", attended);
                students.add(studentData);
            }
        }
        return students;
    }

    // Get students below 75%
    public List<Map<String, Object>> getLowAttendanceStudents() {
        List<Map<String, Object>> all = getSectionStudents();
        List<Map<String, Object>> low = new ArrayList<>();
        for (Map<String, Object> s : all) {
            if ("LOW".equals(s.get("status"))) {
                low.add(s);
            }
        }
        return low;
    }

    // Get faculty report for advisor's department
    public List<Map<String, Object>> getFacultyReport() {
        User advisor = getCurrentAdvisor();
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();

        for (User u : allUsers) {
            if (u.getRole() == User.Role.FACULTY
                    && advisor.getDepartment().equals(u.getDepartment())) {
                List<ClassSession> sessions =
                    sessionRepository.findByFacultyEmail(u.getEmail());

                Map<String, Object> facultyData = new HashMap<>();
                facultyData.put("name", u.getName());
                facultyData.put("email", u.getEmail());
                facultyData.put("totalClasses", sessions.size());
                report.add(facultyData);
            }
        }
        return report;
    }

    // Get advisor dashboard summary
    public Map<String, Object> getDashboardSummary() {
        User advisor = getCurrentAdvisor();
        List<Map<String, Object>> students = getSectionStudents();
        List<Map<String, Object>> lowStudents = getLowAttendanceStudents();
        List<Map<String, Object>> facultyReport = getFacultyReport();

        Map<String, Object> summary = new HashMap<>();
        summary.put("advisorName", advisor.getName());
        summary.put("department", advisor.getDepartment());
        summary.put("section", advisor.getSection());
        summary.put("totalStudents", students.size());
        summary.put("lowAttendanceCount", lowStudents.size());
        summary.put("totalFaculty", facultyReport.size());
        summary.put("students", students);
        summary.put("lowAttendanceStudents", lowStudents);
        summary.put("facultyReport", facultyReport);
        return summary;
    }
// Remove student from section
public Map<String, String> removeStudent(String studentEmail) {
    Map<String, String> response = new HashMap<>();
    User advisor = getCurrentAdvisor();

    User student = userRepository.findByEmail(studentEmail)
            .orElse(null);

    if (student == null) {
        response.put("error", "Student not found!");
        return response;
    }

    // Only remove students from advisor's section
    if (!advisor.getDepartment().equals(student.getDepartment())
            || !advisor.getSection().equals(student.getSection())) {
        response.put("error",
            "You can only remove students from your section!");
        return response;
    }

    userRepository.delete(student);
    response.put("message",
        "Student " + studentEmail + " removed successfully!");
    return response;
}
}