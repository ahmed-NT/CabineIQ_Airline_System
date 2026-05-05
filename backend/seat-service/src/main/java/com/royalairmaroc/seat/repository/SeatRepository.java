package com.royalairmaroc.seat.repository;

import com.royalairmaroc.seat.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByAircraftIdOrderByRowNumberAscSeatLetterAsc(@Param("aircraftId") Long aircraftId);
    Optional<Seat> findBySeatIdAndAircraftId(@Param("seatId") String seatId, @Param("aircraftId") Long aircraftId);
    List<Seat> findByAircraftIdAndStatus(@Param("aircraftId") Long aircraftId, @Param("status") Seat.SeatStatus status);
    Optional<Seat> findByPassengerId(@Param("passengerId") Long passengerId);
    @Transactional
    void deleteByAircraftId(@Param("aircraftId") Long aircraftId);
}
