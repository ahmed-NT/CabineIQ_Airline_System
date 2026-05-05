package com.royalairmaroc.seat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String seatId;

    @Column(nullable = false)
    private Long aircraftId;

    @Column(name = "row_num", nullable = false)
    private Integer rowNumber;

    @Column(nullable = false)
    private String seatLetter;

    @Enumerated(EnumType.STRING)
    private SeatClass seatClass;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    private Long passengerId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum SeatClass { FIRST, BUSINESS, ECONOMY }
    public enum SeatStatus { AVAILABLE, OCCUPIED, UNAVAILABLE }
}
