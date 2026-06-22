package com.royalairmaroc.flight.service;

import com.royalairmaroc.flight.dto.FlightRequestDTO;
import com.royalairmaroc.flight.dto.FlightResponseDTO;
import com.royalairmaroc.flight.entity.Flight;
import com.royalairmaroc.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightServiceImpl implements FlightService {

    private final FlightRepository repository;
    private final RestTemplate restTemplate;

    @Value("${passenger.service.url:http://localhost:8083}")
    private String passengerServiceUrl;

    @Value("${notification.service.url:http://localhost:8089}")
    private String notificationServiceUrl;

    @Override
    public FlightResponseDTO createFlight(FlightRequestDTO dto) {
        if (repository.existsByFlightNumber(dto.getFlightNumber())) {
            throw new RuntimeException("Flight number already exists");
        }

        Flight.FlightStatus status = Flight.FlightStatus.SCHEDULED;
        if (dto.getStatus() != null) {
            try {
                status = Flight.FlightStatus.valueOf(dto.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore, leave as default
            }
        }

        Flight flight = Flight.builder()
                .flightNumber(dto.getFlightNumber())
                .origin(dto.getOrigin())
                .destination(dto.getDestination())
                .departureTime(dto.getDepartureTime())
                .arrivalTime(dto.getArrivalTime())
                .status(status)
                .aircraftId(dto.getAircraftId())
                .gate(dto.getGate())
                .build();

        Flight saved = repository.save(flight);
        return mapToDTO(saved);
    }

    @Override
    public FlightResponseDTO getFlightById(Long id) {
        Flight flight = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        return mapToDTO(flight);
    }

    @Override
    public FlightResponseDTO getFlightByNumber(String number) {
        Flight flight = repository.findByFlightNumber(number)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        return mapToDTO(flight);
    }

    @Override
    public List<FlightResponseDTO> getAllFlights() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FlightResponseDTO updateFlight(Long id, FlightRequestDTO dto) {
        Flight flight = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        if (!flight.getFlightNumber().equals(dto.getFlightNumber()) && 
            repository.existsByFlightNumber(dto.getFlightNumber())) {
            throw new RuntimeException("Flight number already exists");
        }

        flight.setFlightNumber(dto.getFlightNumber());
        flight.setOrigin(dto.getOrigin());
        flight.setDestination(dto.getDestination());
        flight.setDepartureTime(dto.getDepartureTime());
        flight.setArrivalTime(dto.getArrivalTime());
        
        if (dto.getStatus() != null) {
            try {
                flight.setStatus(Flight.FlightStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
        
        flight.setAircraftId(dto.getAircraftId());
        flight.setGate(dto.getGate());

        Flight saved = repository.save(flight);
        return mapToDTO(saved);
    }

    @Override
    public FlightResponseDTO updateStatus(Long id, String status) {
        Flight flight = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        try {
            flight.setStatus(Flight.FlightStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status");
        }

        Flight saved = repository.save(flight);
        FlightResponseDTO dto = mapToDTO(saved);

        // Async email to passengers on key status changes
        try {
            notifyPassengersByEmail(dto);
        } catch (Exception e) {
            log.warn("Email notification failed for flight {}: {}", id, e.getMessage());
        }

        return dto;
    }

    @SuppressWarnings("unchecked")
    private void notifyPassengersByEmail(FlightResponseDTO flight) {
        String statusUpper = flight.getStatus();
        if (!"BOARDING".equals(statusUpper) && !"ARRIVED".equals(statusUpper) && !"CANCELLED".equals(statusUpper)) {
            return;
        }

        ResponseEntity<List> passRes = restTemplate.getForEntity(
            passengerServiceUrl + "/api/passengers/flight/" + flight.getId(), List.class);
        if (passRes.getBody() == null) return;

        for (Object obj : passRes.getBody()) {
            if (!(obj instanceof Map)) continue;
            Map<String, Object> passenger = (Map<String, Object>) obj;
            String email = (String) passenger.get("email");
            String firstName = (String) passenger.getOrDefault("firstName", "Passenger");
            String seatId = (String) passenger.getOrDefault("seatId", "TBA");
            if (email == null || email.isBlank()) continue;

            String subject;
            String body;
            String feedbackUrl = "http://localhost:3000/passenger?passport=" + passenger.get("passportNumber");

            switch (statusUpper) {
                case "BOARDING" -> {
                    subject = "Flight " + flight.getFlightNumber() + " — Boarding Now";
                    body = "Dear " + firstName + ",\n\n" +
                        "Flight " + flight.getFlightNumber() + " (" + flight.getOrigin() +
                        " → " + flight.getDestination() + ") is now BOARDING.\n" +
                        "Your seat: " + seatId + "\n" +
                        (flight.getGate() != null ? "Gate: " + flight.getGate() + "\n" : "") +
                        "\nPlease proceed to the gate immediately.\n\n" +
                        "Royal Air Maroc";
                }
                case "ARRIVED" -> {
                    subject = "Flight " + flight.getFlightNumber() + " — We've Landed!";
                    body = "Dear " + firstName + ",\n\n" +
                        "Your flight " + flight.getFlightNumber() + " has arrived at " +
                        flight.getDestination() + ".\n\n" +
                        "We'd love to hear about your experience:\n" + feedbackUrl + "\n\n" +
                        "Thank you for flying with Royal Air Maroc.";
                }
                case "CANCELLED" -> {
                    subject = "IMPORTANT: Flight " + flight.getFlightNumber() + " Cancelled";
                    body = "Dear " + firstName + ",\n\n" +
                        "We regret to inform you that flight " + flight.getFlightNumber() +
                        " (" + flight.getOrigin() + " → " + flight.getDestination() +
                        ") has been CANCELLED.\n\n" +
                        "Please contact our support team for rebooking options.\n\n" +
                        "We sincerely apologize for the inconvenience.\n\nRoyal Air Maroc";
                }
                default -> { continue; }
            }

            restTemplate.postForEntity(
                notificationServiceUrl + "/notifications/send-email",
                Map.of("to", email, "subject", subject, "body", body),
                Void.class
            );
        }
    }

    @Override
    public void deleteFlight(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Flight not found");
        }
        repository.deleteById(id);
    }

    private FlightResponseDTO mapToDTO(Flight f) {
        return FlightResponseDTO.builder()
                .id(f.getId())
                .flightNumber(f.getFlightNumber())
                .origin(f.getOrigin())
                .destination(f.getDestination())
                .departureTime(f.getDepartureTime())
                .arrivalTime(f.getArrivalTime())
                .status(f.getStatus() != null ? f.getStatus().name() : null)
                .aircraftId(f.getAircraftId())
                .gate(f.getGate())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
