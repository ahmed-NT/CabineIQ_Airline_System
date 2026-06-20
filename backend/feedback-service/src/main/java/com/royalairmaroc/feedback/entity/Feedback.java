package com.royalairmaroc.feedback.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long flightId;
    private String seatId;
    private String seatClass;
    private String route;

    private Integer departureHour;
    private Integer departureDay;
    private Integer departureMonth;
    private Double occupancyPct;

    private String tripPurpose;
    private String companionCount;
    private String bookingWindow;
    private String bookingChannel;
    private String flightsPerYear;
    private String competitorUsed;

    private String pricePaidRange;
    private String pricePerception;
    private String experienceVsExpectation;
    private Integer comfortRating;
    private Integer serviceRating;

    private Boolean wtpNoLayover;
    private Boolean wtpLegroom;
    private Boolean wtpBags;
    private Boolean wtpWifi;

    private String returnIntent;
    private String nextDestination;
    private String nextTravelWindow;
    private String bookingDecisionFactor;
    private String loyaltySensitive;

    private Integer purchaseIntentScore;
    private String offerShown;
    private Boolean offerClicked;

    private String incentiveEmail;

    private LocalDateTime submittedAt;

    @PrePersist
    void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
        if (offerClicked == null) {
            offerClicked = false;
        }
    }
}
