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

    @Value("${services.aircraft-url:http://localhost:8081/api/aircraft}")
    private String aircraftServiceUrl;

    // ── Seat letters by row width (mirrors the frontend column layout) ─────────
    // 9-wide → A B C | D E F G | H J  (the frontend skips "I", so we use "J")
    // 6-wide → A B C | D E F
    // 4-wide → A B | C D
    private String[] getLetters(int seatsPerRow) {
        return switch (seatsPerRow) {
            case 9 -> new String[]{"A","B","C","D","E","F","G","H","J"};
            case 8 -> new String[]{"A","B","C","D","E","F","G","H"};
            case 7 -> new String[]{"A","B","C","D","E","F","G"};
            case 5 -> new String[]{"A","B","C","D","E"};
            case 4 -> new String[]{"A","B","C","D"};
            case 3 -> new String[]{"A","B","C"};
            case 2 -> new String[]{"A","B"};
            default -> new String[]{"A","B","C","D","E","F"}; // 6-wide narrow body
        };
    }

    // Class assigned per row based on the aircraft model. Letters are always full,
    // so every row is completely filled — only the class (colour) changes by zone.
    // Every model has the three cabins in front-to-back order: First → Business → Economy.
    private Seat.SeatClass getSeatClass(int row, String layoutType) {
        return switch (layoutType == null ? "B737" : layoutType.toUpperCase()) {
            // First 1-4 | Business 5-10 | Economy 11+
            case "B787_9" -> row <= 4  ? Seat.SeatClass.FIRST
                           : row <= 10 ? Seat.SeatClass.BUSINESS
                           : Seat.SeatClass.ECONOMY;
            // First 1-3 | Business 4-8 | Economy 9+
            case "B787_8" -> row <= 3  ? Seat.SeatClass.FIRST
                           : row <= 8  ? Seat.SeatClass.BUSINESS
                           : Seat.SeatClass.ECONOMY;
            // First 1-2 | Business 3-4 | Economy 5+   (regional turboprop)
            case "ATR72"  -> row <= 2  ? Seat.SeatClass.FIRST
                           : row <= 4  ? Seat.SeatClass.BUSINESS
                           : Seat.SeatClass.ECONOMY;
            // First 1-2 | Business 3-5 | Economy 6+   (B737 / default)
            default       -> row <= 2  ? Seat.SeatClass.FIRST
                           : row <= 5  ? Seat.SeatClass.BUSINESS
                           : Seat.SeatClass.ECONOMY;
        };
    }

    private int defaultSeatsPerRow(String layoutType) {
        return switch (layoutType == null ? "B737" : layoutType.toUpperCase()) {
            case "B787_8", "B787_9" -> 9;
            case "ATR72" -> 4;
            default -> 6;
        };
    }

    private int defaultTotalRows(String layoutType) {
        return switch (layoutType == null ? "B737" : layoutType.toUpperCase()) {
            case "B787_9" -> 48;
            case "B787_8" -> 40;
            case "ATR72" -> 18;
            default -> 26;
        };
    }

    // Fetch the authoritative cabin structure from the aircraft-service.
    // The seat-service trusts this over any value sent by the client, so the
    // generated seats always match the aircraft's real definition.
    private AircraftInfoDTO fetchAircraft(Long aircraftId) {
        try {
            return restTemplate.getForObject(
                aircraftServiceUrl + "/" + aircraftId, AircraftInfoDTO.class);
        } catch (Exception e) {
            log.warn("Could not fetch aircraft {} from aircraft-service: {}",
                aircraftId, e.getMessage());
            return null;
        }
    }

    @Override
    public List<SeatDTO> generateSeats(GenerateSeatsRequestDTO request) {
        Long aircraftId = request.getAircraftId();
        seatRepository.deleteByAircraftId(aircraftId);

        // ── Source of truth: the aircraft entity in the aircraft-service ──────
        AircraftInfoDTO aircraft = fetchAircraft(aircraftId);

        String layoutType = aircraft != null && aircraft.getLayoutType() != null
            ? aircraft.getLayoutType()
            : request.getLayoutType();

        int seatsPerRow = aircraft != null && aircraft.getSeatsPerRow() != null && aircraft.getSeatsPerRow() > 0
            ? aircraft.getSeatsPerRow()
            : (request.getSeatsPerRow() != null && request.getSeatsPerRow() > 0
                ? request.getSeatsPerRow()
                : defaultSeatsPerRow(layoutType));

        int totalRows = aircraft != null && aircraft.getTotalRows() != null && aircraft.getTotalRows() > 0
            ? aircraft.getTotalRows()
            : (request.getTotalRows() != null && request.getTotalRows() > 0
                ? request.getTotalRows()
                : defaultTotalRows(layoutType));

        String[] letters = getLetters(seatsPerRow);

        log.info("Generating seats for aircraft {}: layout={}, {} rows x {} seats/row",
            aircraftId, layoutType, totalRows, seatsPerRow);

        List<Seat> seats = new ArrayList<>();
        for (int row = 1; row <= totalRows; row++) {
            Seat.SeatClass seatClass = getSeatClass(row, layoutType);
            for (String letter : letters) {
                seats.add(Seat.builder()
                    .seatId(row + letter)
                    .aircraftId(aircraftId)
                    .rowNumber(row)
                    .seatLetter(letter)
                    .seatClass(seatClass)
                    .status(Seat.SeatStatus.AVAILABLE)
                    .build());
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
            String layout = aircraftCode != null && !aircraftCode.isEmpty() ? aircraftCode : "B737";
            int seatsPerRow = defaultSeatsPerRow(layout);
            int totalRows = defaultTotalRows(layout);
            String[] letters = getLetters(seatsPerRow);
            seatMap.setSeatsPerRow(seatsPerRow);
            seatMap.setLayoutType(layout);

            List<RowDTO> defaultRows = new ArrayList<>();
            for (int r = 1; r <= totalRows; r++) {
                RowDTO row = new RowDTO();
                row.setRowNumber(r);
                row.setSeatClass(getSeatClass(r, layout).name());
                List<SeatNodeDTO> nodes = new ArrayList<>();
                for (String letter : letters) {
                    nodes.add(new SeatNodeDTO(r + letter, "AVAILABLE", null, letter));
                }
                row.setSeats(nodes);
                defaultRows.add(row);
            }
            seatMap.setRows(defaultRows);
            return seatMap;
        }

        // Compute max seats per row from actual data and derive layoutType
        int maxSeatsPerRow = (int) seats.stream()
            .collect(Collectors.groupingBy(Seat::getRowNumber, Collectors.counting()))
            .values().stream().mapToLong(Long::longValue).max().orElse(6L);
        seatMap.setSeatsPerRow(maxSeatsPerRow);
        seatMap.setLayoutType(
            maxSeatsPerRow == 9 ? "B787" :
            maxSeatsPerRow == 4 ? "ATR72" : "B737"
        );

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
                Seat s = rowSeats.get(i);
                nodes.add(new SeatNodeDTO(
                    s.getSeatId(), s.getStatus().name(), null, s.getSeatLetter()));
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

        if (seatMap.getRows().isEmpty() && !scoreMap.isEmpty()) {
            buildRowsFromScores(seatMap, scoreMap, aircraftCode);
        }

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

    private void buildRowsFromScores(SeatMapDTO seatMap, Map<String, SeatScore> scoreMap, String layoutType) {
        int seatsPerRow = defaultSeatsPerRow(layoutType);
        String[] letters = getLetters(seatsPerRow);
        int totalRows = defaultTotalRows(layoutType);

        seatMap.setSeatsPerRow(seatsPerRow);
        seatMap.setLayoutType(layoutType != null && !layoutType.isEmpty() ? layoutType : "B737");

        List<RowDTO> rows = new ArrayList<>();
        for (int r = 1; r <= totalRows; r++) {
            RowDTO row = new RowDTO();
            row.setRowNumber(r);
            row.setSeatClass(getSeatClass(r, layoutType != null ? layoutType : "B737").name());

            List<SeatNodeDTO> seats = new ArrayList<>();
            for (String letter : letters) {
                String seatId = r + letter;
                SeatNodeDTO node = new SeatNodeDTO(seatId, "AVAILABLE", null, letter);
                seats.add(node);
            }
            row.setSeats(seats);
            rows.add(row);
        }
        seatMap.setRows(rows);
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
