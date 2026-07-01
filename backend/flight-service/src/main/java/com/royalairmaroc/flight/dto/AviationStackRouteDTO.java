package com.royalairmaroc.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AviationStackRouteDTO {
    private String flightIata;
    private String airlineName;
    private String departureAirport;
    private String departureIata;
    private String arrivalAirport;
    private String arrivalIata;
    private String flightStatus;
}
