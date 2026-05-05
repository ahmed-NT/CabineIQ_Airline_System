package com.royalairmaroc.passenger.service;

import com.royalairmaroc.passenger.dto.PassengerRequestDTO;
import com.royalairmaroc.passenger.dto.PassengerResponseDTO;
import com.royalairmaroc.passenger.entity.Passenger;
import com.royalairmaroc.passenger.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PassengerServiceImpl implements PassengerService {

    private final PassengerRepository repository;

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
