package com.royalairmaroc.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Position en temps réel d'un avion Royal Air Maroc (source : OpenSky Network). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveAircraftDTO {
    private String callsign;
    private Double latitude;
    private Double longitude;
    private Double heading;    // degrés (true track)
    private Double altitude;   // mètres
    private Double velocity;   // m/s
    private boolean onGround;
}
