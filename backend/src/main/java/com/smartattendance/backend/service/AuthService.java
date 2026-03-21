package com.smartattendance.backend.service;

import com.smartattendance.backend.dto.LoginRequest;
import com.smartattendance.backend.dto.RegisterRequest;
import com.smartattendance.backend.model.User;
import com.smartattendance.backend.repository.UserRepository;
import com.smartattendance.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, String> register(RegisterRequest request) {
        Map<String, String> response = new HashMap<>();

        if (userRepository.existsByEmail(request.getEmail())) {
            response.put("error", "Email already registered!");
            return response;
        }

        User user = new User();
        user.setRollNumber(request.getRollNumber());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDepartment(request.getDepartment());
        user.setSection(request.getSection());
        try {
    user.setRole(User.Role.valueOf(
        request.getRole().toUpperCase().trim()));
} catch (IllegalArgumentException e) {
    response.put("error", "Invalid role: " + request.getRole());
    return response;
}

        userRepository.save(user);
        response.put("message", "User registered successfully!");
        return response;
    }

    public Map<String, Object> login(LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(
                request.getPassword(), user.getPassword())) {
            response.put("error", "Invalid email or password!");
            return response;
        }

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());

        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("department", user.getDepartment());
        response.put("section", user.getSection());
        return response;
    }
}