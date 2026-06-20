package com.royalairmaroc.feedback.service;

import com.royalairmaroc.feedback.dto.AnalyticsDTO;
import com.royalairmaroc.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackAnalyticsService {

    private final FeedbackRepository feedbackRepository;

    public AnalyticsDTO getAnalytics() {
        long total = feedbackRepository.count();
        Double avgScore = feedbackRepository.averageIntentScore();
        double averageIntentScore = avgScore != null ? round(avgScore) : 0.0;

        long clicked = feedbackRepository.countOfferClicked();
        double offerClickRate = total > 0 ? round(clicked * 100.0 / total) : 0.0;

        AnalyticsDTO.SegmentCountsDTO segments = AnalyticsDTO.SegmentCountsDTO.builder()
                .highValue(feedbackRepository.countHighValue())
                .potential(feedbackRepository.countPotential())
                .priceSensitive(feedbackRepository.countPriceSensitive())
                .build();

        return AnalyticsDTO.builder()
                .totalSurveys(total)
                .averageIntentScore(averageIntentScore)
                .offerClickRate(offerClickRate)
                .segmentCounts(segments)
                .intentByTripPurpose(mapCategoryScores(feedbackRepository.avgScoreByTripPurpose()))
                .intentByBookingChannel(mapCategoryScores(feedbackRepository.avgScoreByBookingChannel()))
                .offerClickRateByScoreBand(buildScoreBands())
                .priceSensitivityByRoute(buildRouteSensitivity())
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    private List<AnalyticsDTO.CategoryScoreDTO> mapCategoryScores(List<Object[]> rows) {
        List<AnalyticsDTO.CategoryScoreDTO> result = new ArrayList<>();
        if (rows == null) {
            return result;
        }
        for (Object[] row : rows) {
            result.add(AnalyticsDTO.CategoryScoreDTO.builder()
                    .category(row[0] != null ? row[0].toString() : "UNKNOWN")
                    .averageScore(round(((Number) row[1]).doubleValue()))
                    .count(((Number) row[2]).longValue())
                    .build());
        }
        return result;
    }

    private List<AnalyticsDTO.BandClickRateDTO> buildScoreBands() {
        int[][] bands = {{0, 30}, {31, 50}, {51, 70}, {71, 100}};
        String[] labels = {"0-30", "31-50", "51-70", "71-100"};
        List<AnalyticsDTO.BandClickRateDTO> result = new ArrayList<>();

        for (int i = 0; i < bands.length; i++) {
            long total = feedbackRepository.countInScoreRange(bands[i][0], bands[i][1]);
            long clicked = feedbackRepository.countClickedInScoreRange(bands[i][0], bands[i][1]);
            double rate = total > 0 ? round(clicked * 100.0 / total) : 0.0;
            result.add(AnalyticsDTO.BandClickRateDTO.builder()
                    .band(labels[i])
                    .clickRate(rate)
                    .build());
        }
        return result;
    }

    private List<AnalyticsDTO.RouteSensitivityDTO> buildRouteSensitivity() {
        List<AnalyticsDTO.RouteSensitivityDTO> result = new ArrayList<>();
        List<Object[]> rows = feedbackRepository.priceSensitivityByRoute();
        if (rows == null) {
            return result;
        }
        for (Object[] row : rows) {
            result.add(AnalyticsDTO.RouteSensitivityDTO.builder()
                    .route(formatRoute(row[0].toString()))
                    .sensitivityPct(round(((Number) row[1]).doubleValue()))
                    .build());
        }
        return result;
    }

    private String formatRoute(String route) {
        return route.replace("-", "→");
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
