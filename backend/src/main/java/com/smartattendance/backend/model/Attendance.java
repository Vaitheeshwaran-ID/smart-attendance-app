package com.smartattendance.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentEmail;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String department;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private ClassSession session;

    @Column(nullable = false)
    private LocalDateTime markedAt;

    private Double studentLatitude;
    private Double studentLongitude;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PRESENT;

    public enum Status {
        PRESENT, LATE, ABSENT
    }
}