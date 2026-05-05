package com.royalairmaroc.flight.controller;

import com.royalairmaroc.flight.dto.FlightRequestDTO;
import com.royalairmaroc.flight.dto.FlightResponseDTO;
import com.royalairmaroc.flight.service.FlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<List<FlightResponseDTO>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }

    @PostMapping(consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FlightResponseDTO> createFlight(@Valid @RequestBody FlightRequestDTO dto) {
        return new ResponseEntity<>(flightService.createFlight(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightResponseDTO> getFlightById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    @GetMapping("/number/{number}")
    public ResponseEntity<FlightResponseDTO> getFlightByNumber(@PathVariable("number") String number) {
        return ResponseEntity.ok(flightService.getFlightByNumber(number));
    }

    @PutMapping(value = "/{id}", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FlightResponseDTO> updateFlight(
            @PathVariable("id") Long id,
            @Valid @RequestBody FlightRequestDTO dto) {
        return ResponseEntity.ok(flightService.updateFlight(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FlightResponseDTO> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(flightService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable("id") Long id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }
}
