package com.royalairmaroc.flight.controller;

import com.royalairmaroc.flight.dto.AviationStackRouteDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flights/routes")
@CrossOrigin
@Slf4j
public class AviationStackController {

    private static final String AVIATIONSTACK_URL =
        "http://api.aviationstack.com/v1/flights?access_key=%s&airline_iata=AT&limit=100";

    @Value("${aviationstack.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private volatile List<AviationStackRouteDTO> cache = List.of();
    private volatile long lastFetch = 0L;
    private static final long CACHE_TTL = 5 * 60 * 1000L;

    public AviationStackController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public List<AviationStackRouteDTO> getRoutes() {
        long now = System.currentTimeMillis();
        if (now - lastFetch < CACHE_TTL && !cache.isEmpty()) {
            return cache;
        }

        try {
            String url = String.format(AVIATIONSTACK_URL, apiKey);
            Map<?, ?> body = restTemplate.getForObject(url, Map.class);
            Object dataObj = body == null ? null : body.get("data");
            List<?> data = dataObj instanceof List ? (List<?>) dataObj : List.of();

            List<AviationStackRouteDTO> result = new ArrayList<>();
            for (Object item : data) {
                if (!(item instanceof Map)) continue;
                Map<?, ?> flight = (Map<?, ?>) item;

                Map<?, ?> departure = (Map<?, ?>) flight.get("departure");
                Map<?, ?> arrival = (Map<?, ?>) flight.get("arrival");
                Map<?, ?> flightInfo = (Map<?, ?>) flight.get("flight");
                Map<?, ?> airline = (Map<?, ?>) flight.get("airline");

                if (departure == null || arrival == null) continue;

                String depIata = departure.get("iata") == null ? null : departure.get("iata").toString();
                String arrIata = arrival.get("iata") == null ? null : arrival.get("iata").toString();
                if (depIata == null || arrIata == null) continue;

                result.add(AviationStackRouteDTO.builder()
                    .flightIata(flightInfo == null || flightInfo.get("iata") == null
                        ? "" : flightInfo.get("iata").toString())
                    .airlineName(airline == null || airline.get("name") == null
                        ? "Royal Air Maroc" : airline.get("name").toString())
                    .departureAirport(departure.get("airport") == null
                        ? "" : departure.get("airport").toString())
                    .departureIata(depIata)
                    .arrivalAirport(arrival.get("airport") == null
                        ? "" : arrival.get("airport").toString())
                    .arrivalIata(arrIata)
                    .flightStatus(flight.get("flight_status") == null
                        ? "scheduled" : flight.get("flight_status").toString())
                    .build());
            }

            cache = result;
            lastFetch = now;
            log.info("AviationStack: {} route(s) Royal Air Maroc", result.size());
        } catch (Exception e) {
            log.warn("AviationStack fetch failed: {}", e.getMessage());
        }
        return cache;
    }
}
