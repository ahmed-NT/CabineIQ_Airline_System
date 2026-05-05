package com.royalairmaroc.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeatNodeDTO {
    private String seatId;
    private String status;
    private String type;
}
