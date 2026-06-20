package com.royalairmaroc.feedback.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponseDTO {

    private Long id;
    private Long flightId;
    private String seatId;
    private String seatClass;
    private String route;
    private String tripPurpose;
    private Integer purchaseIntentScore;
    private String offerShown;
    private Boolean offerClicked;
    private LocalDateTime submittedAt;
}
