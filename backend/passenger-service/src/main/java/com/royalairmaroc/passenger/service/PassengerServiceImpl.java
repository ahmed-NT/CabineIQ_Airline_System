package com.royalairmaroc.passenger.service;

import com.royalairmaroc.passenger.dto.PassengerRequestDTO;
import com.royalairmaroc.passenger.dto.PassengerResponseDTO;
import com.royalairmaroc.passenger.entity.Passenger;
import com.royalairmaroc.passenger.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PassengerServiceImpl implements PassengerService {

    private final PassengerRepository repository;
    private final RestTemplate restTemplate;

    @Value("${gateway.url:http://localhost:8080}")
    private String gatewayUrl;

    @Value("${seat.service.url:http://localhost:8082}")
    private String seatServiceUrl;

    @Override
    public PassengerResponseDTO createPassenger(PassengerRequestDTO dto) {
        if (repository.existsByPassportNumber(dto.getPassportNumber())) {
            throw new RuntimeException("Passenger with passport already exists");
        }

        Passenger passenger = Passenger.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .passportNumber(dto.getPassportNumber())
                .nationality(dto.getNationality())
                .flightId(dto.getFlightId())
                .seatId(dto.getSeatId())
                .aircraftId(dto.getAircraftId())
                .build();

        Passenger saved = repository.save(passenger);
        return mapToDTO(saved);
    }

    @Override
    public PassengerResponseDTO getPassengerById(Long id) {
        Passenger passenger = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));
        return mapToDTO(passenger);
    }

    @Override
    public List<PassengerResponseDTO> getAllPassengers() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PassengerResponseDTO> searchByName(String name) {
        return repository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PassengerResponseDTO> getPassengersByFlight(Long flightId) {
        return repository.findByFlightId(flightId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PassengerResponseDTO assignSeat(Long id, String seatId, Long aircraftId) {
        Passenger passenger = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));
    
        passenger.setSeatId(seatId);
        passenger.setAircraftId(aircraftId);
    
        Passenger saved = repository.save(passenger);
    
        try {
            String url = seatServiceUrl + "/api/seats/" + seatId + "/status?aircraftId=" + aircraftId;
            Map<String, String> body = Map.of("status", "OCCUPIED");
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<Map<String, String>> request =
                new org.springframework.http.HttpEntity<>(body, headers);
            restTemplate.exchange(url,
                org.springframework.http.HttpMethod.PUT,
                request,
                Void.class);
        } catch (Exception e) {
            System.err.println("Failed to update seat status: " + e.getMessage());
        }
    
        return mapToDTO(saved);
    }

    @Override
    public void deletePassenger(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Passenger not found");
        }
        repository.deleteById(id);
    }

    private PassengerResponseDTO mapToDTO(Passenger p) {
        return PassengerResponseDTO.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .fullName(p.getFirstName() + " " + p.getLastName())
                .email(p.getEmail())
                .passportNumber(p.getPassportNumber())
                .nationality(p.getNationality())
                .flightId(p.getFlightId())
                .seatId(p.getSeatId())
                .aircraftId(p.getAircraftId())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
