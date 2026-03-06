package com.smartattendance.backend.service;

import com.smartattendance.backend.dto.MarkAttendanceRequest;
import com.smartattendance.backend.dto.StartClassRequest;
import com.smartattendance.backend.model.Attendance;
import com.smartattendance.backend.model.ClassSession;
import com.smartattendance.backend.repository.AttendanceRepository;
import com.smartattendance.backend.repository.ClassSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AttendanceService {

    @Autowired
    private ClassSessionRepository sessionRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    // Faculty starts class → generates QR
    public Map<String, Object> startClass(StartClassRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Get faculty email from JWT token
        String facultyEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        // Generate unique QR token
        String qrToken = UUID.randomUUID().toString();

        // Create session
        ClassSession session = new ClassSession();
        session.setSubject(request.getSubject());
        session.setDepartment(request.getDepartment());
        session.setFacultyEmail(facultyEmail);
        session.setQrToken(qrToken);
        session.setStartedAt(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        session.setFacultyLatitude(request.getFacultyLatitude());
        session.setFacultyLongitude(request.getFacultyLongitude());
        session.setStatus(ClassSession.Status.ACTIVE);

        sessionRepository.save(session);

        response.put("message", "Class started successfully!");
        response.put("qrToken", qrToken);
        response.put("expiresAt", session.getExpiresAt());
        response.put("sessionId", session.getId());
        return response;
    }

    // Student marks attendance using QR
    public Map<String, String> markAttendance(
            MarkAttendanceRequest request) {
        Map<String, String> response = new HashMap<>();

        // Get student email from JWT token
        String studentEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        // Find session by QR token
        ClassSession session = sessionRepository
                .findByQrToken(request.getQrToken())
                .orElse(null);

        if (session == null) {
            response.put("error", "Invalid QR code!");
            return response;
        }

        // Check if QR is expired
        if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
            response.put("error", "QR code has expired!");
            return response;
        }

        // Check if already marked
        if (attendanceRepository.existsByStudentEmailAndSession_Id(
                studentEmail, session.getId())) {
            response.put("error", "Attendance already marked!");
            return response;
        }

        // GPS verification (within 100 meters)
        if (request.getStudentLatitude() != null
                && request.getStudentLongitude() != null
                && session.getFacultyLatitude() != null) {
            double distance = calculateDistance(
                request.getStudentLatitude(),
                request.getStudentLongitude(),
                session.getFacultyLatitude(),
                session.getFacultyLongitude()
            );

            if (distance > 100) {
                response.put("error",
                    "You are too far from class! Distance: "
                    + Math.round(distance) + " meters");
                return response;
            }
        }

       // Determine PRESENT or LATE
LocalDateTime tenMinsAfterStart =
    session.getStartedAt().plusMinutes(10);
Attendance.Status attendanceStatus =
    LocalDateTime.now().isAfter(tenMinsAfterStart)
        ? Attendance.Status.LATE
        : Attendance.Status.PRESENT;

// Mark attendance
Attendance attendance = new Attendance();
attendance.setStudentEmail(studentEmail);
attendance.setSubject(session.getSubject());
attendance.setDepartment(session.getDepartment());
attendance.setSession(session);
attendance.setMarkedAt(LocalDateTime.now());
attendance.setStudentLatitude(request.getStudentLatitude());
attendance.setStudentLongitude(request.getStudentLongitude());
attendance.setStatus(attendanceStatus);

response.put("message",
    attendanceStatus == Attendance.Status.LATE
        ? "Marked as LATE! Please be on time next class."
        : "Attendance marked successfully!");

        attendanceRepository.save(attendance);

        response.put("message", "Attendance marked successfully!");
        return response;
    }

    // Get student attendance summary
    public Map<String, Object> getStudentSummary(String subject) {
        Map<String, Object> response = new HashMap<>();

        String studentEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        List<Attendance> records = attendanceRepository
                .findByStudentEmailAndSubject(studentEmail, subject);

        long totalClasses = sessionRepository
                .findBySubjectAndDepartment(subject, "")
                .size();
        long attended = records.size();
        double percentage = totalClasses > 0
                ? (attended * 100.0 / totalClasses) : 0;

        response.put("subject", subject);
        response.put("attended", attended);
        response.put("percentage", Math.round(percentage) + "%");
        response.put("records", records);
        return response;
    }

    // Get all students in a session
    public List<Attendance> getSessionAttendance(Long sessionId) {
        return attendanceRepository.findBySession_Id(sessionId);
    }

    // Get faculty sessions
    public List<ClassSession> getFacultySessions() {
        String facultyEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return sessionRepository.findByFacultyEmail(facultyEmail);
    }

    // Calculate GPS distance in meters
    private double calculateDistance(double lat1, double lon1,
            double lat2, double lon2) {
        final int EARTH_RADIUS = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }
}