package com.royalairmaroc.flight.scheduler;

import com.royalairmaroc.flight.entity.Flight;
import com.royalairmaroc.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FlightStatusScheduler {

    private final FlightRepository flightRepository;

    @Scheduled(fixedRate = 60000) // runs every 60 seconds
    public void autoUpdateFlightStatuses() {
        LocalDateTime now = LocalDateTime.now();

        List<Flight> flights = flightRepository.findAll().stream()
            .filter(f -> f.getStatus() != Flight.FlightStatus.CANCELLED &&
                         f.getStatus() != Flight.FlightStatus.DELAYED)
            .toList();

        int updated = 0;
        for (Flight flight : flights) {
            Flight.FlightStatus computed = computeStatus(flight, now);
            if (computed != null && computed != flight.getStatus()) {
                flight.setStatus(computed);
                flightRepository.save(flight);
                updated++;
                log.info("Auto-updated flight {} → {}", flight.getFlightNumber(), computed);
            }
        }

        if (updated > 0) {
            log.info("Auto-status job: updated {} flight(s)", updated);
        }
    }

    private Flight.FlightStatus computeStatus(Flight flight, LocalDateTime now) {
        LocalDateTime dep = flight.getDepartureTime();
        LocalDateTime arr = flight.getArrivalTime();

        if (dep == null) return null;

        if (arr != null && now.isAfter(arr)) {
            return Flight.FlightStatus.ARRIVED;
        }
        if (now.isAfter(dep)) {
            return Flight.FlightStatus.DEPARTED;
        }
        if (now.isAfter(dep.minusMinutes(30))) {
            return Flight.FlightStatus.BOARDING;
        }
        if (now.isBefore(dep.minusMinutes(30))) {
            return Flight.FlightStatus.SCHEDULED;
        }
        return null;
    }
}
