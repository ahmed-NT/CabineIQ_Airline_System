package com.royalairmaroc.feedback.controller;

import com.royalairmaroc.feedback.dto.AnalyticsDTO;
import com.royalairmaroc.feedback.dto.FeedbackRequestDTO;
import com.royalairmaroc.feedback.dto.FeedbackResponseDTO;
import com.royalairmaroc.feedback.service.FeedbackAnalyticsService;
import com.royalairmaroc.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final FeedbackAnalyticsService analyticsService;

    @PostMapping
    public ResponseEntity<FeedbackResponseDTO> submit(@RequestBody FeedbackRequestDTO dto) {
        return new ResponseEntity<>(feedbackService.submit(dto), HttpStatus.CREATED);
    }

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getByFlight(@PathVariable Long flightId) {
        return ResponseEntity.ok(feedbackService.getByFlight(flightId));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }
}
