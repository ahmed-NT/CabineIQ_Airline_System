package com.royalairmaroc.feedback.service;

import com.royalairmaroc.feedback.dto.FeedbackRequestDTO;
import com.royalairmaroc.feedback.dto.FeedbackResponseDTO;
import com.royalairmaroc.feedback.entity.Feedback;
import com.royalairmaroc.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackResponseDTO submit(FeedbackRequestDTO dto) {
        Feedback feedback = Feedback.builder()
                .flightId(dto.getFlightId())
                .seatId(dto.getSeatId())
                .seatClass(dto.getSeatClass())
                .route(dto.getRoute())
                .tripPurpose(dto.getTripPurpose())
                .companionCount(dto.getCompanionCount())
                .bookingWindow(dto.getBookingWindow())
                .bookingChannel(dto.getBookingChannel())
                .flightsPerYear(dto.getFlightsPerYear())
                .competitorUsed(dto.getCompetitorUsed())
                .pricePaidRange(dto.getPricePaidRange())
                .pricePerception(dto.getPricePerception())
                .experienceVsExpectation(dto.getExperienceVsExpectation())
                .comfortRating(dto.getComfortRating())
                .serviceRating(dto.getServiceRating())
                .wtpNoLayover(dto.getWtpNoLayover())
                .wtpLegroom(dto.getWtpLegroom())
                .wtpBags(dto.getWtpBags())
                .wtpWifi(dto.getWtpWifi())
                .returnIntent(dto.getReturnIntent())
                .nextDestination(dto.getNextDestination())
                .nextTravelWindow(dto.getNextTravelWindow())
                .bookingDecisionFactor(dto.getBookingDecisionFactor())
                .loyaltySensitive(dto.getLoyaltySensitive())
                .purchaseIntentScore(dto.getPurchaseIntentScore())
                .offerShown(dto.getOfferShown())
                .offerClicked(dto.getOfferClicked() != null ? dto.getOfferClicked() : false)
                .incentiveEmail(dto.getIncentiveEmail())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return toResponse(saved);
    }

    public List<FeedbackResponseDTO> getByFlight(Long flightId) {
        return feedbackRepository.findByFlightId(flightId).stream()
                .map(this::toResponse)
                .toList();
    }

    private FeedbackResponseDTO toResponse(Feedback f) {
        return FeedbackResponseDTO.builder()
                .id(f.getId())
                .flightId(f.getFlightId())
                .seatId(f.getSeatId())
                .seatClass(f.getSeatClass())
                .route(f.getRoute())
                .tripPurpose(f.getTripPurpose())
                .purchaseIntentScore(f.getPurchaseIntentScore())
                .offerShown(f.getOfferShown())
                .offerClicked(f.getOfferClicked())
                .submittedAt(f.getSubmittedAt())
                .build();
    }
}
