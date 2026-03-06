package com.smartattendance.backend.dto;

import lombok.Data;

@Data
public class MarkAttendanceRequest {
    private String qrToken;
    private Double studentLatitude;
    private Double studentLongitude;
}