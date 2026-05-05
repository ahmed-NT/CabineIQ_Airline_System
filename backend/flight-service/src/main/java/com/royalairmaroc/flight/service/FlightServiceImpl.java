package com.royalairmaroc.flight.service;

import com.royalairmaroc.flight.dto.FlightRequestDTO;
import com.royalairmaroc.flight.dto.FlightResponseDTO;
import com.royalairmaroc.flight.entity.Flight;
import com.royalairmaroc.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository repository;

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
        return mapToDTO(saved);
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
