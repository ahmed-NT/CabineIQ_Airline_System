package com.royalairmaroc.passenger.service;

import com.royalairmaroc.passenger.dto.PassengerRequestDTO;
import com.royalairmaroc.passenger.dto.PassengerResponseDTO;

import java.util.List;

public interface PassengerService {

    PassengerResponseDTO createPassenger(PassengerRequestDTO dto);

    PassengerResponseDTO getPassengerById(Long id);

    List<PassengerResponseDTO> getAllPassengers();

    List<PassengerResponseDTO> searchByName(String name);

    List<PassengerResponseDTO> getPassengersByFlight(Long flightId);

    PassengerResponseDTO assignSeat(Long id, String seatId, Long aircraftId);

    void deletePassenger(Long id);
}
