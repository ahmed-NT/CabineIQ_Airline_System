package com.royalairmaroc.seat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"seatId", "aircraftId", "flightId"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String seatId;

    @Column(nullable = false)
    private Long aircraftId;

    @Column(nullable = false)
    private Long flightId;

    @Column(nullable = false)
    private Integer score;

    private boolean lostItem;

    @Column(length = 500)
    private String lostItemDescription;

    private String scoredBy;

    @CreationTimestamp
    private LocalDateTime scoredAt;
}
