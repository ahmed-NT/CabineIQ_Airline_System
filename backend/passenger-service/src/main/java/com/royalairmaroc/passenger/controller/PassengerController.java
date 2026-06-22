package com.royalairmaroc.passenger.controller;

import com.royalairmaroc.passenger.dto.PassengerRequestDTO;
import com.royalairmaroc.passenger.dto.PassengerResponseDTO;
import com.royalairmaroc.passenger.repository.PassengerRepository;
import com.royalairmaroc.passenger.service.PassengerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PassengerController {

    private final PassengerService passengerService;
    private final PassengerRepository passengerRepository;

    @GetMapping
    public ResponseEntity<List<PassengerResponseDTO>> getAllPassengers() {
        return ResponseEntity.ok(passengerService.getAllPassengers());
    }

    @PostMapping
    public ResponseEntity<PassengerResponseDTO> createPassenger(@Valid @RequestBody PassengerRequestDTO dto) {
        return new ResponseEntity<>(passengerService.createPassenger(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PassengerResponseDTO> getPassengerById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(passengerService.getPassengerById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PassengerResponseDTO>> searchByName(@RequestParam("name") String name) {
        return ResponseEntity.ok(passengerService.searchByName(name));
    }

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<PassengerResponseDTO>> getPassengersByFlight(@PathVariable("flightId") Long flightId) {
        return ResponseEntity.ok(passengerService.getPassengersByFlight(flightId));
    }

    @PutMapping("/{id}/assign-seat")
    public ResponseEntity<PassengerResponseDTO> assignSeat(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> body) {
        String seatId = (String) body.get("seatId");
        Long aircraftId = Long.valueOf(body.get("aircraftId").toString());
        return ResponseEntity.ok(passengerService.assignSeat(id, seatId, aircraftId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassenger(@PathVariable("id") Long id) {
        passengerService.deletePassenger(id);
        return ResponseEntity.noContent().build();
    }

    /** Public endpoint — no JWT required. Passenger looks up their booking by passport. */
    @GetMapping("/portal")
    public ResponseEntity<?> portalLookup(@RequestParam("passport") String passport) {
        return passengerRepository.findByPassportNumber(passport)
            .map(p -> {
                var dto = passengerService.getPassengerById(p.getId());
                return ResponseEntity.ok(dto);
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
