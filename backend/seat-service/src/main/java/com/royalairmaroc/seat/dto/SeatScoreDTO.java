package com.royalairmaroc.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeatScoreDTO {
    private Long id;
    private String seatId;
    private Integer score;
    private boolean lostItem;
    private String lostItemDescription;
    private String scoredBy;
    private LocalDateTime scoredAt;
    private String scoreColor;
}
