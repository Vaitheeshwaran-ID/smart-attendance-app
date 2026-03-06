package com.smartattendance.backend.dto;

import lombok.Data;

@Data
public class TimetableRequest {
    private String subject;
    private String facultyEmail;
    private String day;
    private String startTime;
    private String endTime;
    private String department;
    private String room;
}