package com.royalairmaroc.flight.controller;

import com.royalairmaroc.flight.dto.LiveAircraftDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Expose les avions Royal Air Maroc actuellement en vol (positions ADS-B en
 * temps réel via l'API publique OpenSky Network). Les résultats sont mis en
 * cache 15 s afin de respecter les quotas de l'API.
 */
@RestController
@RequestMapping("/api/flights/live")
@CrossOrigin
@Slf4j
public class LiveFlightController {

    // Boîte englobante couvrant le réseau RAM (Atlantique -> Moyen-Orient).
    private static final String OPENSKY_URL =
        "https://opensky-network.org/api/states/all?lamin=10&lomin=-80&lamax=62&lomax=60";

    private final RestTemplate restTemplate = new RestTemplate();
    private volatile List<LiveAircraftDTO> cache = List.of();
    private volatile long lastFetch = 0L;

    @GetMapping
    public List<LiveAircraftDTO> liveRamFlights() {
        long now = System.currentTimeMillis();
        if (now - lastFetch < 15_000L && !cache.isEmpty()) {
            return cache;
        }

        try {
            Map<?, ?> body = restTemplate.getForObject(OPENSKY_URL, Map.class);
            Object statesObj = body == null ? null : body.get("states");
            List<?> states = statesObj instanceof List ? (List<?>) statesObj : List.of();

            List<LiveAircraftDTO> result = new ArrayList<>();
            for (Object o : states) {
                if (!(o instanceof List)) continue;
                List<?> s = (List<?>) o;
                String callsign = s.get(1) == null ? "" : s.get(1).toString().trim();
                if (!callsign.startsWith("RAM")) continue;
                if (s.get(5) == null || s.get(6) == null) continue; // position absente

                result.add(LiveAircraftDTO.builder()
                    .callsign(callsign)
                    .longitude(((Number) s.get(5)).doubleValue())
                    .latitude(((Number) s.get(6)).doubleValue())
                    .altitude(s.get(7) == null ? 0.0 : ((Number) s.get(7)).doubleValue())
                    .onGround(Boolean.TRUE.equals(s.get(8)))
                    .velocity(s.get(9) == null ? 0.0 : ((Number) s.get(9)).doubleValue())
                    .heading(s.get(10) == null ? 0.0 : ((Number) s.get(10)).doubleValue())
                    .build());
            }
            cache = result;
            lastFetch = now;
            log.info("OpenSky: {} vol(s) RAM en l'air", result.size());
        } catch (Exception e) {
            log.warn("Echec de la récupération OpenSky : {}", e.getMessage());
        }
        return cache;
    }
}
