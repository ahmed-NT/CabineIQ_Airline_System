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

    public SeatNodeDTO(String seatId, String status, String type) {
        this.seatId = seatId;
        this.status = status;
        this.type = type;
    }
}
