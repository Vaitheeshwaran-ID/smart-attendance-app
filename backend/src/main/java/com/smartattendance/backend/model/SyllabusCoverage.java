package com.smartattendance.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "syllabus_coverage")
public class SyllabusCoverage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private String facultyEmail;

    @Column(nullable = false)
    private String unitNumber;

    @Column(nullable = false)
    private String topicCovered;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String timePeriod;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    private Status status = Status.COMPLETED;

    public enum Status {
        COMPLETED, IN_PROGRESS, PLANNED
    }
}