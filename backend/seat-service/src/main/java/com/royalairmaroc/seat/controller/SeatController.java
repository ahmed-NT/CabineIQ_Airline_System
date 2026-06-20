package com.royalairmaroc.seat.controller;

import com.royalairmaroc.seat.dto.*;
import com.royalairmaroc.seat.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping(value = "/generate", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<SeatDTO>> generateSeats(
            @RequestBody GenerateSeatsRequestDTO request) {
        return ResponseEntity.ok(seatService.generateSeats(request));
    }

    @GetMapping("/aircraft/{aircraftId}")
    public ResponseEntity<SeatMapDTO> getSeatMap(
            @PathVariable("aircraftId") Long aircraftId,
            @RequestParam(required = false, defaultValue = "") String aircraftCode) {
        return ResponseEntity.ok(seatService.getSeatMap(aircraftId, aircraftCode));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatDTO> getSeatById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(seatService.getSeatById(id));
    }

    @PutMapping(value = "/{seatId}/status")
    public ResponseEntity<SeatDTO> updateSeatStatus(
            @PathVariable("seatId") String seatId,
            @RequestParam("aircraftId") Long aircraftId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            seatService.updateSeatStatus(seatId, aircraftId, body.get("status")));
    }

    @DeleteMapping("/aircraft/{aircraftId}")
    public ResponseEntity<Void> deleteAllSeats(
            @PathVariable("aircraftId") Long aircraftId) {
        seatService.deleteAllSeatsForAircraft(aircraftId);
        return ResponseEntity.noContent().build();
    }
}
