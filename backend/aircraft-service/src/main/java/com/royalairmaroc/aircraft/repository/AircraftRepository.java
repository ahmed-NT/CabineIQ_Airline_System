package com.royalairmaroc.aircraft.repository;

import com.royalairmaroc.aircraft.entity.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AircraftRepository extends JpaRepository<Aircraft, Long> {
    Optional<Aircraft> findByAircraftCode(String aircraftCode);
    Optional<Aircraft> findByRegistration(String registration);
    List<Aircraft> findByStatus(Aircraft.AircraftStatus status);
    boolean existsByAircraftCode(String aircraftCode);
    boolean existsByRegistration(String registration);
}
