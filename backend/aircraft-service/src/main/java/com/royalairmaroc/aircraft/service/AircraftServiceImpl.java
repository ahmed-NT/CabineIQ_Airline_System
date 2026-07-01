package com.royalairmaroc.aircraft.service;

import com.royalairmaroc.aircraft.dto.AircraftRequestDTO;
import com.royalairmaroc.aircraft.dto.AircraftResponseDTO;
import com.royalairmaroc.aircraft.entity.Aircraft;
import com.royalairmaroc.aircraft.exception.AircraftNotFoundException;
import com.royalairmaroc.aircraft.repository.AircraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AircraftServiceImpl implements AircraftService {

    private final AircraftRepository aircraftRepository;

    @Override
    public AircraftResponseDTO createAircraft(AircraftRequestDTO dto) {
        Aircraft aircraft = Aircraft.builder()
            .aircraftCode(dto.getAircraftCode())
            .model(dto.getModel())
            .registration(dto.getRegistration())
            .totalRows(dto.getTotalRows())
            .seatsPerRow(dto.getSeatsPerRow())
            .totalSeats(dto.getTotalSeats())
            .layoutType(dto.getLayoutType())
            .status(dto.getStatus() != null ?
                Aircraft.AircraftStatus.valueOf(dto.getStatus().toUpperCase()) :
                Aircraft.AircraftStatus.ACTIVE)
            .build();
        return mapToDTO(aircraftRepository.save(aircraft));
    }

    @Override
    public AircraftResponseDTO getAircraftById(Long id) {
        return mapToDTO(aircraftRepository.findById(id)
            .orElseThrow(() -> new AircraftNotFoundException("Aircraft not found with id: " + id)));
    }

    @Override
    public AircraftResponseDTO getAircraftByCode(String code) {
        return mapToDTO(aircraftRepository.findByAircraftCode(code)
            .orElseThrow(() -> new AircraftNotFoundException("Aircraft not found with code: " + code)));
    }

    @Override
    public List<AircraftResponseDTO> getAllAircraft() {
        return aircraftRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public AircraftResponseDTO updateAircraft(Long id, AircraftRequestDTO dto) {
        Aircraft aircraft = aircraftRepository.findById(id)
            .orElseThrow(() -> new AircraftNotFoundException("Aircraft not found with id: " + id));
        aircraft.setAircraftCode(dto.getAircraftCode());
        aircraft.setModel(dto.getModel());
        aircraft.setRegistration(dto.getRegistration());
        aircraft.setTotalRows(dto.getTotalRows());
        aircraft.setSeatsPerRow(dto.getSeatsPerRow());
        aircraft.setTotalSeats(dto.getTotalSeats());
        aircraft.setLayoutType(dto.getLayoutType());
        aircraft.setStatus(dto.getStatus() != null ?
            Aircraft.AircraftStatus.valueOf(dto.getStatus().toUpperCase()) :
            Aircraft.AircraftStatus.ACTIVE);
        return mapToDTO(aircraftRepository.save(aircraft));
    }

    @Override
    public void deleteAircraft(Long id) {
        aircraftRepository.findById(id)
            .orElseThrow(() -> new AircraftNotFoundException("Aircraft not found with id: " + id));
        aircraftRepository.deleteById(id);
    }

    private AircraftResponseDTO mapToDTO(Aircraft aircraft) {
        AircraftResponseDTO dto = new AircraftResponseDTO();
        dto.setId(aircraft.getId());
        dto.setAircraftCode(aircraft.getAircraftCode());
        dto.setModel(aircraft.getModel());
        dto.setRegistration(aircraft.getRegistration());
        dto.setTotalRows(aircraft.getTotalRows());
        dto.setSeatsPerRow(aircraft.getSeatsPerRow());
        dto.setTotalSeats(aircraft.getTotalSeats());
        dto.setLayoutType(aircraft.getLayoutType());
        dto.setStatus(aircraft.getStatus().name());
        dto.setCreatedAt(aircraft.getCreatedAt());
        dto.setUpdatedAt(aircraft.getUpdatedAt());
        return dto;
    }
}
