package com.royalairmaroc.seat.dto;

import lombok.Data;

@Data
public class GenerateSeatsRequestDTO {
    private Long aircraftId;
    private Integer totalRows;
    private String layoutType;
    private String aircraftCode;
}
