package com.royalairmaroc.seat.service;

import com.royalairmaroc.seat.dto.*;
import com.royalairmaroc.seat.entity.Seat;
import com.royalairmaroc.seat.entity.SeatScore;
import com.royalairmaroc.seat.exception.SeatNotFoundException;
import com.royalairmaroc.seat.repository.SeatRepository;
import com.royalairmaroc.seat.repository.SeatScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final SeatScoreRepository seatScoreRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RestTemplate restTemplate;

    @Value("${services.passenger-url:http://localhost:8083/api/passengers}")
    private String passengerServiceUrl;

    @Value("${services.notification-url:http://localhost:8089/notifications}")
    private String notificationServiceUrl;

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

    @Override
    public SeatScoreDTO scoreSeat(SeatScoreRequestDTO request, String scoredBy) {
        SeatScore score = seatScoreRepository
            .findBySeatIdAndAircraftIdAndFlightId(
                request.getSeatId(), request.getAircraftId(), request.getFlightId())
            .orElse(SeatScore.builder()
                .seatId(request.getSeatId())
                .aircraftId(request.getAircraftId())
                .flightId(request.getFlightId())
                .build());

        score.setScore(request.getScore());
        score.setLostItem(request.isLostItem());
        score.setLostItemDescription(request.getLostItemDescription());
        score.setScoredBy(scoredBy);

        SeatScore saved = seatScoreRepository.save(score);
        SeatScoreDTO dto = mapToScoreDTO(saved);

        messagingTemplate.convertAndSend(
            "/topic/scores/" + request.getAircraftId() + "/" + request.getFlightId(),
            dto);

        if (request.isLostItem()) {
            notifyPassengerAboutLostItem(request);
        }

        return dto;
    }

    @Override
    public List<SeatScoreDTO> getScoresByFlight(Long aircraftId, Long flightId) {
        return seatScoreRepository.findByAircraftIdAndFlightId(aircraftId, flightId)
            .stream().map(this::mapToScoreDTO).collect(Collectors.toList());
    }

    @Override
    public SeatMapDTO getSeatMapWithScores(Long aircraftId, String aircraftCode, Long flightId) {
        SeatMapDTO seatMap = getSeatMap(aircraftId, aircraftCode);

        Map<String, SeatScore> scoreMap = seatScoreRepository
            .findByAircraftIdAndFlightId(aircraftId, flightId)
            .stream().collect(Collectors.toMap(SeatScore::getSeatId, s -> s));

        for (RowDTO row : seatMap.getRows()) {
            for (SeatNodeDTO node : row.getSeats()) {
                if (node.getSeatId() == null) continue;
                SeatScore score = scoreMap.get(node.getSeatId());
                if (score != null) {
                    node.setScore(score.getScore());
                    node.setLostItem(score.isLostItem());
                    node.setLostItemDescription(score.getLostItemDescription());
                    node.setScoreColor(computeScoreColor(score));
                } else {
                    node.setScoreColor("unscored");
                }
            }
        }
        return seatMap;
    }

    private String computeScoreColor(SeatScore score) {
        if (score.isLostItem()) return "lostitem";
        if (score.getScore() <= 2) return "dirty";
        return "clean";
    }

    @SuppressWarnings("unchecked")
    private void notifyPassengerAboutLostItem(SeatScoreRequestDTO request) {
        try {
            Map<String, Object> passenger = restTemplate.getForObject(
                passengerServiceUrl + "/seat-lookup?seatId=" + request.getSeatId()
                    + "&aircraftId=" + request.getAircraftId(),
                Map.class);

            if (passenger == null) return;
            String email = (String) passenger.get("email");
            String firstName = (String) passenger.getOrDefault("firstName", "Passenger");
            if (email == null || email.isBlank()) return;

            String subject = "Lost Item Found at Your Seat";
            String body = "Dear " + firstName + ",\n\n" +
                "An item was found at your seat (" + request.getSeatId() + ").\n" +
                "Description: " + (request.getLostItemDescription() != null
                    ? request.getLostItemDescription() : "No description provided") +
                "\n\nPlease contact our support team to arrange retrieval.\n\nRoyal Air Maroc";

            restTemplate.postForEntity(
                notificationServiceUrl + "/send-email",
                Map.of("to", email, "subject", subject, "body", body),
                Void.class);

            log.info("Lost item notification sent to {} for seat {}", email, request.getSeatId());
        } catch (Exception e) {
            log.warn("Failed to send lost item notification for seat {}: {}",
                request.getSeatId(), e.getMessage());
        }
    }

    private SeatScoreDTO mapToScoreDTO(SeatScore score) {
        SeatScoreDTO dto = new SeatScoreDTO();
        dto.setId(score.getId());
        dto.setSeatId(score.getSeatId());
        dto.setScore(score.getScore());
        dto.setLostItem(score.isLostItem());
        dto.setLostItemDescription(score.getLostItemDescription());
        dto.setScoredBy(score.getScoredBy());
        dto.setScoredAt(score.getScoredAt());
        dto.setScoreColor(computeScoreColor(score));
        return dto;
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
