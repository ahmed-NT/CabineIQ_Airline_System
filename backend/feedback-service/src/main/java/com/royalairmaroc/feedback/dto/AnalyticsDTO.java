package com.royalairmaroc.feedback.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDTO {

    private long totalSurveys;
    private double averageIntentScore;
    private double offerClickRate;
    private SegmentCountsDTO segmentCounts;
    private List<CategoryScoreDTO> intentByTripPurpose;
    private List<CategoryScoreDTO> intentByBookingChannel;
    private List<BandClickRateDTO> offerClickRateByScoreBand;
    private List<RouteSensitivityDTO> priceSensitivityByRoute;
    private LocalDateTime lastUpdated;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SegmentCountsDTO {
        @JsonProperty("HIGH_VALUE")
        private long highValue;
        @JsonProperty("POTENTIAL")
        private long potential;
        @JsonProperty("PRICE_SENSITIVE")
        private long priceSensitive;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryScoreDTO {
        private String category;
        private double averageScore;
        private long count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BandClickRateDTO {
        private String band;
        private double clickRate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RouteSensitivityDTO {
        private String route;
        private double sensitivityPct;
    }
}
