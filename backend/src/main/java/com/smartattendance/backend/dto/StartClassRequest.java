package com.smartattendance.backend.dto;

import lombok.Data;

@Data
public class StartClassRequest {
    private String subject;
    private String department;
    private Double facultyLatitude;
    private Double facultyLongitude;
}