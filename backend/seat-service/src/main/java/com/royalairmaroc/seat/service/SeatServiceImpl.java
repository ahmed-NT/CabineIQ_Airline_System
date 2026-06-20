package com.royalairmaroc.seat.service;

import com.royalairmaroc.seat.dto.*;
import com.royalairmaroc.seat.entity.Seat;
import com.royalairmaroc.seat.exception.SeatNotFoundException;
import com.royalairmaroc.seat.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;

    @Override
    public List<SeatDTO> generateSeats(GenerateSeatsRequestDTO request) {
        seatRepository.deleteByAircraftId(request.getAircraftId());
        List<Seat> seats = new ArrayList<>();
        String[] narrowLetters = {"A", "B", "C", "D", "E", "F"};

        for (int row = 1; row <= request.getTotalRows(); row++) {
            Seat.SeatClass seatClass;
            if (row <= 2) seatClass = Seat.SeatClass.FIRST;
            else if (row <= 6) seatClass = Seat.SeatClass.BUSINESS;
            else seatClass = Seat.SeatClass.ECONOMY;

            for (String letter : narrowLetters) {
                Seat seat = Seat.builder()
                    .seatId(row + letter)
                    .aircraftId(request.getAircraftId())
                    .rowNumber(row)
                    .seatLetter(letter)
                    .seatClass(seatClass)
                    .status(Seat.SeatStatus.AVAILABLE)
                    .build();
                seats.add(seat);
            }
        }
        return seatRepository.saveAll(seats).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public SeatMapDTO getSeatMap(Long aircraftId, String aircraftCode) {
        List<Seat> seats = seatRepository
            .findByAircraftIdOrderByRowNumberAscSeatLetterAsc(aircraftId);

        SeatMapDTO seatMap = new SeatMapDTO();
        seatMap.setAircraftId(aircraftId);
        seatMap.setAircraftCode(aircraftCode != null ? aircraftCode : "");
        seatMap.setRows(new ArrayList<>());

        if (seats.isEmpty()) {
            return seatMap;
        }

        Map<Integer, List<Seat>> groupedByRow = seats.stream()
            .collect(Collectors.groupingBy(Seat::getRowNumber,
                     LinkedHashMap::new, Collectors.toList()));

        List<RowDTO> rows = new ArrayList<>();
        for (Map.Entry<Integer, List<Seat>> entry : 
             groupedByRow.entrySet()) {
            RowDTO rowDTO = new RowDTO();
            rowDTO.setRowNumber(entry.getKey());
            
            List<Seat> rowSeats = entry.getValue();
            if (!rowSeats.isEmpty()) {
                rowDTO.setSeatClass(
                    rowSeats.get(0).getSeatClass().name());
            }

            List<SeatNodeDTO> nodes = new ArrayList<>();
            for (int i = 0; i < rowSeats.size(); i++) {
                if (i == 3) {
                    nodes.add(new SeatNodeDTO(null, null, "AISLE"));
                }
                Seat s = rowSeats.get(i);
                nodes.add(new SeatNodeDTO(
                    s.getSeatId(), s.getStatus().name(), null));
            }
            rowDTO.setSeats(nodes);
            rows.add(rowDTO);
        }
        seatMap.setRows(rows);
        return seatMap;
    }

    @Override
    public SeatDTO updateSeatStatus(String seatId,
                                    Long aircraftId,
                                    String status) {
        Seat seat = seatRepository
            .findBySeatIdAndAircraftId(seatId, aircraftId)
            .orElseThrow(() -> new SeatNotFoundException(
                "Seat not found: " + seatId));
        seat.setStatus(Seat.SeatStatus.valueOf(status));
        return mapToDTO(seatRepository.save(seat));
    }

    @Override
    public SeatDTO getSeatById(Long id) {
        return mapToDTO(seatRepository.findById(id)
            .orElseThrow(() -> new SeatNotFoundException(
                "Seat not found with id: " + id)));
    }

    @Override
    public void deleteAllSeatsForAircraft(Long aircraftId) {
        seatRepository.deleteByAircraftId(aircraftId);
    }

    private SeatDTO mapToDTO(Seat seat) {
        SeatDTO dto = new SeatDTO();
        dto.setId(seat.getId());
        dto.setSeatId(seat.getSeatId());
        dto.setAircraftId(seat.getAircraftId());
        dto.setRowNumber(seat.getRowNumber());
        dto.setSeatLetter(seat.getSeatLetter());
        dto.setSeatClass(seat.getSeatClass().name());
        dto.setStatus(seat.getStatus().name());
        dto.setPassengerId(seat.getPassengerId());
        return dto;
    }
}
