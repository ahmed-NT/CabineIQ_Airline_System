package com.royalairmaroc.feedback.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRequestDTO {

    private Long flightId;
    private String seatId;
    private String seatClass;
    private String route;

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
}
