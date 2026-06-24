package com.royalairmaroc.seat.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SeatScoreRequestDTO {

    @NotBlank
    private String seatId;

    @NotNull
    private Long aircraftId;

    @NotNull
    private Long flightId;

    @NotNull
    @Min(0)
    @Max(5)
    private Integer score;

    private boolean lostItem;

    @Size(max = 500)
    private String lostItemDescription;
}
