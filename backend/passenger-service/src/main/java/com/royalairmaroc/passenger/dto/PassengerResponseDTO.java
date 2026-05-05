package com.royalairmaroc.passenger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String passportNumber;
    private String nationality;
    private Long flightId;
    private String seatId;
    private Long aircraftId;
    private LocalDateTime createdAt;
}
