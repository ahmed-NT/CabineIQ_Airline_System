package com.royalairmaroc.seat.service;

import com.royalairmaroc.seat.dto.*;
import java.util.List;

public interface SeatService {
    SeatMapDTO getSeatMap(Long aircraftId, String aircraftCode);
    List<SeatDTO> generateSeats(GenerateSeatsRequestDTO request);
    SeatDTO updateSeatStatus(String seatId, Long aircraftId, String status);
    SeatDTO getSeatById(Long id);
    void deleteAllSeatsForAircraft(Long aircraftId);
}
