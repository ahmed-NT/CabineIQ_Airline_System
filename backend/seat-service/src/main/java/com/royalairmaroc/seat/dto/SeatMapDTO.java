package com.royalairmaroc.seat.dto;

import lombok.Data;
import java.util.List;

@Data
public class SeatMapDTO {
    private Long aircraftId;
    private String aircraftCode;
    private Integer seatsPerRow;
    private String layoutType;
    private List<RowDTO> rows;
}
