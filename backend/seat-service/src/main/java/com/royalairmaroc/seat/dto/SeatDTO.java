package com.royalairmaroc.seat.dto;

import lombok.Data;

@Data
public class SeatDTO {
    private Long id;
    private String seatId;
    private Long aircraftId;
    private Integer rowNumber;
    private String seatLetter;
    private String seatClass;
    private String status;
    private Long passengerId;
}
