package com.smartattendance.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String rollNumber;
    private String name;
    private String email;
    private String password;
    private String role;
    private String department;
    private String section;
}