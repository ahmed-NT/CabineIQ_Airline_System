package com.royalairmaroc.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.royalairmaroc.ai.dto.AiQueryRequest;
import com.royalairmaroc.ai.dto.AiQueryResponse;
import com.royalairmaroc.ai.dto.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private static final String SYSTEM_PROMPT = """
            You are CabineIQ, an AI assistant for Royal Air Maroc operations staff.
            You have access to the following internal APIs:

            GET /api/flights          → list all flights with status, route, aircraft
            GET /api/flights/{id}     → get one flight
            GET /api/passengers/search?name={name}  → search passenger by name
            GET /api/passengers/flight/{flightId}   → all passengers on a flight
            GET /api/seats/aircraft/{aircraftId}    → seat map for an aircraft

            Based on the user's question, respond ONLY with a JSON object:
            {
              "apiCall": "GET /api/flights",
              "params": {},
              "responseKey": "flights",
              "naturalLanguageTemplate": "There are {count} delayed flights: {names}"
            }

            If the question cannot be answered by an API call (e.g. general questions),
            set apiCall to null and include a "directAnswer" field instead.
            """;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${anthropic.api-key:}")
    private String apiKey;

    @Value("${anthropic.api-url}")
    private String apiUrl;

    @Value("${anthropic.model}")
    private String model;

    @Value("${gateway.url}")
    private String gatewayUrl;

    public AiQueryResponse processQuery(AiQueryRequest request) {
        String query = request.getQuery();
        if (query == null || query.isBlank()) {
            return AiQueryResponse.builder()
                    .answer("Please enter a question.")
                    .build();
        }

        if (apiKey == null || apiKey.isBlank()) {
            return unavailable();
        }

        try {
            String routingResponse = callClaude(SYSTEM_PROMPT, buildMessages(request));
            JsonNode routing = parseJson(routingResponse);

            if (routing == null) {
                return unavailable();
            }

            if (routing.has("directAnswer") && !routing.get("directAnswer").isNull()) {
                return AiQueryResponse.builder()
                        .answer(routing.get("directAnswer").asText())
                        .actionType("DIRECT")
                        .build();
            }

            String apiCall = routing.has("apiCall") && !routing.get("apiCall").isNull()
                    ? routing.get("apiCall").asText()
                    : null;

            if (apiCall == null || apiCall.isBlank() || "null".equalsIgnoreCase(apiCall)) {
                return AiQueryResponse.builder()
                        .answer("I'm not sure how to answer that with the available data.")
                        .actionType("UNKNOWN")
                        .build();
            }

            String apiData = callInternalApi(apiCall, routing.path("params"));
            if (apiData == null) {
                return AiQueryResponse.builder()
                        .answer("I couldn't retrieve that data right now.")
                        .actionType(deriveActionType(apiCall))
                        .build();
            }

            String formatPrompt = "Given this data: " + apiData
                    + ", answer the question: '" + query + "' in one concise sentence.";
            String answer = callClaude(
                    "You are CabineIQ. Answer concisely using only the provided data.",
                    List.of(ChatMessageDTO.builder().role("user").content(formatPrompt).build())
            );

            if (answer == null || answer.isBlank()) {
                answer = "I found the data but couldn't format a response.";
            }

            return AiQueryResponse.builder()
                    .answer(answer.trim())
                    .actionType(deriveActionType(apiCall))
                    .relatedFlightId(extractFlightId(apiData))
                    .build();

        } catch (Exception e) {
            log.warn("AI query failed: {}", e.getMessage());
            return unavailable();
        }
    }

    private AiQueryResponse unavailable() {
        return AiQueryResponse.builder()
                .answer("AI service is temporarily unavailable.")
                .actionType("UNAVAILABLE")
                .build();
    }

    private List<ChatMessageDTO> buildMessages(AiQueryRequest request) {
        List<ChatMessageDTO> messages = new ArrayList<>();
        if (request.getConversationHistory() != null) {
            messages.addAll(request.getConversationHistory());
        }
        messages.add(ChatMessageDTO.builder()
                .role("user")
                .content(request.getQuery())
                .build());
        return messages;
    }

    private String callClaude(String system, List<ChatMessageDTO> messages) {
        try {
            List<Map<String, String>> apiMessages = messages.stream()
                    .map(m -> Map.of("role", m.getRole(), "content", m.getContent()))
                    .toList();

            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", 1000,
                    "system", system,
                    "messages", apiMessages
            );

            String response = webClient.post()
                    .uri(apiUrl)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null) {
                return null;
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode content = root.path("content");
            if (content.isArray() && !content.isEmpty()) {
                return content.get(0).path("text").asText();
            }
            return null;
        } catch (Exception e) {
            log.warn("Claude API call failed: {}", e.getMessage());
            return null;
        }
    }

    private JsonNode parseJson(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            String cleaned = text.trim();
            if (cleaned.contains("```")) {
                int start = cleaned.indexOf('{');
                int end = cleaned.lastIndexOf('}');
                if (start >= 0 && end > start) {
                    cleaned = cleaned.substring(start, end + 1);
                }
            }
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            log.warn("Failed to parse Claude JSON: {}", e.getMessage());
            return null;
        }
    }

    private String callInternalApi(String apiCall, JsonNode params) {
    try {
        String resolvedPath = apiCall.replace("GET ", "").trim();

        if (params != null && params.isObject() && !params.isEmpty()) {
            if (params.has("id")) {
                resolvedPath = resolvedPath.replace("{id}", params.get("id").asText());
            }
            if (params.has("flightId")) {
                resolvedPath = resolvedPath.replace("{flightId}", params.get("flightId").asText());
            }
            if (params.has("aircraftId")) {
                resolvedPath = resolvedPath.replace("{aircraftId}", params.get("aircraftId").asText());
            }
            if (params.has("name") && resolvedPath.contains("name={name}")) {
                resolvedPath = resolvedPath.replace("name={name}", "name=" + params.get("name").asText());
            } else if (params.has("name")) {
                resolvedPath = resolvedPath + (resolvedPath.contains("?") ? "&" : "?") + "name=" + params.get("name").asText();
            }

            final String pathForLambda = resolvedPath;
            List<String> queryParts = new ArrayList<>();
            params.fields().forEachRemaining(entry -> {
                String key = entry.getKey();
                if (!key.equals("id") && !key.equals("flightId")
                        && !key.equals("aircraftId") && !key.equals("name")
                        && !pathForLambda.contains("{" + key + "}")) {
                    queryParts.add(key + "=" + entry.getValue().asText());
                }
            });

            if (!queryParts.isEmpty() && !resolvedPath.contains("?")) {
                resolvedPath = resolvedPath + "?" + String.join("&", queryParts);
            }
        }

        final String finalUrl = gatewayUrl + resolvedPath;
        return webClient.get()
                .uri(finalUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

    } catch (Exception e) {
        log.warn("Internal API call failed for {}: {}", apiCall, e.getMessage());
        return null;
    }
}

    private String deriveActionType(String apiCall) {
        if (apiCall.contains("/flights")) return "FLIGHTS_QUERY";
        if (apiCall.contains("/passengers/search")) return "PASSENGER_SEARCH";
        if (apiCall.contains("/passengers/flight")) return "PASSENGERS_BY_FLIGHT";
        if (apiCall.contains("/seats/")) return "SEAT_MAP";
        return "DATA_QUERY";
    }

    private Long extractFlightId(String apiData) {
        try {
            JsonNode root = objectMapper.readTree(apiData);
            if (root.isArray() && !root.isEmpty() && root.get(0).has("id")) {
                return root.get(0).get("id").asLong();
            }
            if (root.has("id")) {
                return root.get("id").asLong();
            }
            if (root.has("flightId")) {
                return root.get("flightId").asLong();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
