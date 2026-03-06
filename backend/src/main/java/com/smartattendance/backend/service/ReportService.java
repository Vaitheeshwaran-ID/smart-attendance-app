package com.smartattendance.backend.service;

import com.smartattendance.backend.model.Attendance;
import com.smartattendance.backend.model.ClassSession;
import com.smartattendance.backend.model.Curriculum;
import com.smartattendance.backend.model.User;
import com.smartattendance.backend.repository.AttendanceRepository;
import com.smartattendance.backend.repository.ClassSessionRepository;
import com.smartattendance.backend.repository.CurriculumRepository;
import com.smartattendance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ClassSessionRepository sessionRepository;

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── STUDENT REPORT ───────────────────────────────────

    public Map<String, Object> getStudentReport() {
        String studentEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        List<Attendance> allAttendance = attendanceRepository
                .findByStudentEmail(studentEmail);

        // Group by subject
        Map<String, List<Attendance>> bySubject = new HashMap<>();
        for (Attendance a : allAttendance) {
            bySubject.computeIfAbsent(
                a.getSubject(), k -> new ArrayList<>()).add(a);
        }

        // Calculate % per subject
        List<Map<String, Object>> subjectReports = new ArrayList<>();
        List<String> lowAttendanceSubjects = new ArrayList<>();

        for (Map.Entry<String, List<Attendance>> entry
                : bySubject.entrySet()) {
            String subject = entry.getKey();
            int attended = entry.getValue().size();

            long totalClasses = sessionRepository
                    .findBySubjectAndDepartment(subject, "")
                    .size();

            // Get all sessions for this subject
            List<ClassSession> sessions = sessionRepository
                    .findBySubjectAndDepartment(subject,
                        entry.getValue().get(0).getDepartment());
            totalClasses = sessions.size();

            double percentage = totalClasses > 0
                    ? (attended * 100.0 / totalClasses) : 0;
            String percentStr = Math.round(percentage) + "%";

            Map<String, Object> subjectReport = new HashMap<>();
            subjectReport.put("subject", subject);
            subjectReport.put("attended", attended);
            subjectReport.put("totalClasses", totalClasses);
            subjectReport.put("percentage", percentStr);
            subjectReport.put("status",
                percentage >= 75 ? "✅ Good" : "⚠️ Low Attendance");

            subjectReports.add(subjectReport);

            if (percentage < 75) {
                lowAttendanceSubjects.add(subject);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("studentEmail", studentEmail);
        response.put("subjectReports", subjectReports);
        response.put("lowAttendanceAlerts", lowAttendanceSubjects);
        response.put("totalSubjects", subjectReports.size());
        return response;
    }

    // ─── FACULTY REPORT ───────────────────────────────────

    public Map<String, Object> getFacultyReport() {
        String facultyEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        List<ClassSession> sessions = sessionRepository
                .findByFacultyEmail(facultyEmail);

        // Curriculum completion
        List<Map<String, Object>> sessionReports = new ArrayList<>();

        for (ClassSession session : sessions) {
            List<Attendance> attendees = attendanceRepository
                    .findBySession_Id(session.getId());

            Map<String, Object> sessionReport = new HashMap<>();
            sessionReport.put("sessionId", session.getId());
            sessionReport.put("subject", session.getSubject());
            sessionReport.put("date", session.getStartedAt());
            sessionReport.put("totalStudents", attendees.size());
            sessionReport.put("status", session.getStatus());
            sessionReports.add(sessionReport);
        }

        // Curriculum completion per subject
        Map<String, Object> curriculumStatus = new HashMap<>();
        List<Curriculum> allTopics = curriculumRepository
                .findByDepartment("");

        long completed = allTopics.stream()
                .filter(c -> c.getStatus()
                    == Curriculum.Status.COMPLETED)
                .count();
        long total = allTopics.size();
        double completionPct = total > 0
                ? (completed * 100.0 / total) : 0;

        curriculumStatus.put("totalTopics", total);
        curriculumStatus.put("completedTopics", completed);
        curriculumStatus.put("completionPercentage",
            Math.round(completionPct) + "%");

        Map<String, Object> response = new HashMap<>();
        response.put("facultyEmail", facultyEmail);
        response.put("totalClassesTaken", sessions.size());
        response.put("sessionReports", sessionReports);
        response.put("curriculumStatus", curriculumStatus);
        return response;
    }

    // ─── ADMIN/HOD REPORT ─────────────────────────────────

    public Map<String, Object> getAdminReport(String department) {

        // All students in department
        List<User> allUsers = userRepository.findAll();
        List<String> students = new ArrayList<>();
        List<String> facultyList = new ArrayList<>();

        for (User user : allUsers) {
            if (user.getRole() == User.Role.STUDENT
                    && department.equals(user.getDepartment())) {
                students.add(user.getEmail());
            }
            if (user.getRole() == User.Role.FACULTY
                    && department.equals(user.getDepartment())) {
                facultyList.add(user.getEmail());
            }
        }

        // Students below 75%
        List<Map<String, Object>> lowAttendanceStudents
                = new ArrayList<>();

        for (String studentEmail : students) {
            List<Attendance> records = attendanceRepository
                    .findByStudentEmail(studentEmail);

            if (!records.isEmpty()) {
                Map<String, Set<String>> subjectSessions
                        = new HashMap<>();
                Map<String, Integer> subjectAttended
                        = new HashMap<>();

                for (Attendance a : records) {
                    subjectAttended.merge(
                        a.getSubject(), 1, Integer::sum);
                }

                for (Map.Entry<String, Integer> entry
                        : subjectAttended.entrySet()) {
                    String subject = entry.getKey();
                    int attended = entry.getValue();
                    List<ClassSession> sessions = sessionRepository
                            .findBySubjectAndDepartment(
                                subject, department);
                    int total = sessions.size();
                    double pct = total > 0
                            ? (attended * 100.0 / total) : 0;

                    if (pct < 75) {
                        Map<String, Object> alert = new HashMap<>();
                        alert.put("student", studentEmail);
                        alert.put("subject", subject);
                        alert.put("percentage",
                            Math.round(pct) + "%");
                        lowAttendanceStudents.add(alert);
                    }
                }
            }
        }

        // Faculty sessions count
        List<Map<String, Object>> facultyReport = new ArrayList<>();
        for (String facultyEmail : facultyList) {
            List<ClassSession> sessions = sessionRepository
                    .findByFacultyEmail(facultyEmail);
            Map<String, Object> fr = new HashMap<>();
            fr.put("faculty", facultyEmail);
            fr.put("totalClassesTaken", sessions.size());
            facultyReport.add(fr);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("department", department);
        response.put("totalStudents", students.size());
        response.put("totalFaculty", facultyList.size());
        response.put("lowAttendanceStudents", lowAttendanceStudents);
        response.put("facultyReport", facultyReport);
        return response;
    }
}