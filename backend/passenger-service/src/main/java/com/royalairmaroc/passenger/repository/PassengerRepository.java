package com.royalairmaroc.passenger.repository;

import com.royalairmaroc.passenger.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    List<Passenger> findByFlightId(Long flightId);

    List<Passenger> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);

    Optional<Passenger> findByPassportNumber(String passportNumber);

    Optional<Passenger> findBySeatIdAndAircraftId(String seatId, Long aircraftId);

    boolean existsByPassportNumber(String passportNumber);
}
