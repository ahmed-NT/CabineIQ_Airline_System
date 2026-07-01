package com.royalairmaroc.seat.dto;

import lombok.Data;

@Data
public class GenerateSeatsRequestDTO {
    private Long aircraftId;
    private Integer totalRows;
    private Integer seatsPerRow;
    private String layoutType;
    private String aircraftCode;
}
