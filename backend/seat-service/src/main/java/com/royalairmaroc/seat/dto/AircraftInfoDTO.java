package com.royalairmaroc.seat.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Lightweight view of an aircraft fetched from the aircraft-service.
 * The seat-service uses this — not values sent by the client — as the
 * single source of truth for the cabin structure when generating seats.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AircraftInfoDTO {
    private Long id;
    private String aircraftCode;
    private Integer totalRows;
    private Integer seatsPerRow;
    private String layoutType;
}
