package com.royalairmaroc.ai.controller;

import com.royalairmaroc.ai.dto.AiQueryRequest;
import com.royalairmaroc.ai.dto.AiQueryResponse;
import com.royalairmaroc.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/query")
    public ResponseEntity<AiQueryResponse> query(@RequestBody AiQueryRequest request) {
        return ResponseEntity.ok(aiService.processQuery(request));
    }
}
