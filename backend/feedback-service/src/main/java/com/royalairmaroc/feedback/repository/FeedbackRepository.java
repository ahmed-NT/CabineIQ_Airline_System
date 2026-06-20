package com.royalairmaroc.feedback.repository;

import com.royalairmaroc.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByFlightId(Long flightId);

    @Query("SELECT AVG(f.purchaseIntentScore) FROM Feedback f WHERE f.purchaseIntentScore IS NOT NULL")
    Double averageIntentScore();

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.offerClicked = true")
    long countOfferClicked();

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.purchaseIntentScore >= 71")
    long countHighValue();

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.purchaseIntentScore >= 41 AND f.purchaseIntentScore < 71")
    long countPotential();

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.purchaseIntentScore < 41")
    long countPriceSensitive();

    @Query("""
        SELECT f.tripPurpose, AVG(f.purchaseIntentScore), COUNT(f)
        FROM Feedback f
        WHERE f.tripPurpose IS NOT NULL AND f.purchaseIntentScore IS NOT NULL
        GROUP BY f.tripPurpose
        """)
    List<Object[]> avgScoreByTripPurpose();

    @Query("""
        SELECT f.bookingChannel, AVG(f.purchaseIntentScore), COUNT(f)
        FROM Feedback f
        WHERE f.bookingChannel IS NOT NULL AND f.purchaseIntentScore IS NOT NULL
        GROUP BY f.bookingChannel
        """)
    List<Object[]> avgScoreByBookingChannel();

    @Query("""
        SELECT f.route,
               SUM(CASE WHEN f.loyaltySensitive = 'YES' THEN 1 ELSE 0 END) * 100.0 / COUNT(f)
        FROM Feedback f
        WHERE f.route IS NOT NULL AND f.loyaltySensitive IS NOT NULL
        GROUP BY f.route
        """)
    List<Object[]> priceSensitivityByRoute();

    @Query("""
        SELECT COUNT(f) FROM Feedback f
        WHERE f.purchaseIntentScore IS NOT NULL
          AND f.purchaseIntentScore >= :min AND f.purchaseIntentScore <= :max
        """)
    long countInScoreRange(int min, int max);

    @Query("""
        SELECT COUNT(f) FROM Feedback f
        WHERE f.purchaseIntentScore IS NOT NULL
          AND f.purchaseIntentScore >= :min AND f.purchaseIntentScore <= :max
          AND f.offerClicked = true
        """)
    long countClickedInScoreRange(int min, int max);
}
