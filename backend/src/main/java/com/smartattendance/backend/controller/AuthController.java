package com.smartattendance.backend.controller;

import com.smartattendance.backend.dto.LoginRequest;
import com.smartattendance.backend.dto.RegisterRequest;
import com.smartattendance.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
            authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
            authService.login(request));
    }
}