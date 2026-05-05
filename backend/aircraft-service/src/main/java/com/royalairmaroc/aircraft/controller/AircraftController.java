package com.royalairmaroc.aircraft.controller;

import com.royalairmaroc.aircraft.dto.AircraftRequestDTO;
import com.royalairmaroc.aircraft.dto.AircraftResponseDTO;
import com.royalairmaroc.aircraft.service.AircraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AircraftController {

    private final AircraftService aircraftService;

    @PostMapping
    public ResponseEntity<AircraftResponseDTO> createAircraft(@Valid @RequestBody AircraftRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aircraftService.createAircraft(dto));
    }

    @GetMapping
    public ResponseEntity<List<AircraftResponseDTO>> getAllAircraft() {
        return ResponseEntity.ok(aircraftService.getAllAircraft());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AircraftResponseDTO> getAircraftById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(aircraftService.getAircraftById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<AircraftResponseDTO> getAircraftByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(aircraftService.getAircraftByCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AircraftResponseDTO> updateAircraft(@PathVariable("id") Long id, @Valid @RequestBody AircraftRequestDTO dto) {
        return ResponseEntity.ok(aircraftService.updateAircraft(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAircraft(@PathVariable("id") Long id) {
        aircraftService.deleteAircraft(id);
        return ResponseEntity.noContent().build();
    }
}
