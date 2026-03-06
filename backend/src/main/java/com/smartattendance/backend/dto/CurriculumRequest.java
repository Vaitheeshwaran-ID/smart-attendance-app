package com.smartattendance.backend.dto;

import lombok.Data;

@Data
public class CurriculumRequest {
    private String subject;
    private String department;
    private String unit;
    private String topic;
}