package com.royalairmaroc.aircraft.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "aircraft")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String aircraftCode;

    @Column(nullable = false)
    private String model;

    @Column(unique = true, nullable = false)
    private String registration;

    @Column(nullable = false)
    private Integer totalRows;

    @Column(nullable = false)
    private Integer seatsPerRow;

    @Column(nullable = false)
    private Integer totalSeats;

    // e.g. B737_800, B737_MAX8, B787_8, B787_9, ATR72
    @Column(nullable = false)
    private String layoutType;

    @Enumerated(EnumType.STRING)
    private AircraftStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum AircraftStatus {
        ACTIVE, MAINTENANCE, RETIRED
    }
}
