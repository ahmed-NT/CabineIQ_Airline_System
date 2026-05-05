package com.royalairmaroc.aircraft.service;

import com.royalairmaroc.aircraft.dto.AircraftRequestDTO;
import com.royalairmaroc.aircraft.dto.AircraftResponseDTO;
import java.util.List;

public interface AircraftService {
    AircraftResponseDTO createAircraft(AircraftRequestDTO dto);
    AircraftResponseDTO getAircraftById(Long id);
    AircraftResponseDTO getAircraftByCode(String code);
    List<AircraftResponseDTO> getAllAircraft();
    AircraftResponseDTO updateAircraft(Long id, AircraftRequestDTO dto);
    void deleteAircraft(Long id);
}
