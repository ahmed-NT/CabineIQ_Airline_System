package com.royalairmaroc.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SeatNodeDTO {
    private String seatId;
    private String status;
    private String type;
    private Integer score;
    private Boolean lostItem;
    private String scoreColor;
    private String lostItemDescription;

    private String seatLetter;

    public SeatNodeDTO(String seatId, String status, String type) {
        this.seatId = seatId;
        this.status = status;
        this.type = type;
    }

    public SeatNodeDTO(String seatId, String status, String type, String seatLetter) {
        this.seatId = seatId;
        this.status = status;
        this.type = type;
        this.seatLetter = seatLetter;
    }
}
