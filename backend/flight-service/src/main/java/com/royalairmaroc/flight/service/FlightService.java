package com.royalairmaroc.flight.service;

import com.royalairmaroc.flight.dto.FlightRequestDTO;
import com.royalairmaroc.flight.dto.FlightResponseDTO;

import java.util.List;

public interface FlightService {

    FlightResponseDTO createFlight(FlightRequestDTO dto);

    FlightResponseDTO getFlightById(Long id);

    FlightResponseDTO getFlightByNumber(String number);

    List<FlightResponseDTO> getAllFlights();

    FlightResponseDTO updateFlight(Long id, FlightRequestDTO dto);

    FlightResponseDTO updateStatus(Long id, String status);

    void deleteFlight(Long id);
}
