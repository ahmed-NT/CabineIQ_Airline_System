package com.royalairmaroc.aircraft.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AircraftRequestDTO {
    @NotBlank
    private String aircraftCode;
    @NotBlank
    private String model;
    @NotBlank
    private String registration;
    @NotNull @Min(1)
    private Integer totalRows;
    @NotNull @Min(1)
    private Integer seatsPerRow;
    @NotNull
    private Integer totalSeats;
    private String status = "ACTIVE";
}
