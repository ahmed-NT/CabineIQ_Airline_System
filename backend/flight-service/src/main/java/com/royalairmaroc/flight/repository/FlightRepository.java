package com.royalairmaroc.flight.repository;

import com.royalairmaroc.flight.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    Optional<Flight> findByFlightNumber(String flightNumber);

    List<Flight> findByStatus(Flight.FlightStatus status);

    List<Flight> findByOriginAndDestination(String origin, String destination);

    List<Flight> findByAircraftId(Long aircraftId);

    boolean existsByFlightNumber(String flightNumber);
}
