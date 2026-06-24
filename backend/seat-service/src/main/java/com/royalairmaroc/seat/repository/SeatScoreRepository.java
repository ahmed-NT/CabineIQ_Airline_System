package com.royalairmaroc.seat.repository;

import com.royalairmaroc.seat.entity.SeatScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeatScoreRepository extends JpaRepository<SeatScore, Long> {

    List<SeatScore> findByAircraftIdAndFlightId(Long aircraftId, Long flightId);

    Optional<SeatScore> findBySeatIdAndAircraftIdAndFlightId(String seatId, Long aircraftId, Long flightId);
}
