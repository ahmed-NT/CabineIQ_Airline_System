package com.royalairmaroc.aircraft.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AircraftResponseDTO {
    private Long id;
    private String aircraftCode;
    private String model;
    private String registration;
    private Integer totalRows;
    private Integer seatsPerRow;
    private Integer totalSeats;
    private String layoutType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
