package com.royalairmaroc.passenger.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerRequestDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String email;

    @NotBlank
    private String passportNumber;

    private String nationality;

    private Long flightId;

    private String seatId;

    private Long aircraftId;
}
