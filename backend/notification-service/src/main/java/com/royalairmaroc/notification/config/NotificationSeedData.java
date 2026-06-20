package com.royalairmaroc.notification.config;

import com.royalairmaroc.notification.entity.Notification;
import com.royalairmaroc.notification.entity.NotificationType;
import com.royalairmaroc.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationSeedData implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        if (notificationRepository.count() > 0) {
            return;
        }

        notificationRepository.save(Notification.builder()
                .type(NotificationType.FLIGHT_STATUS)
                .title("AT204 is now DELAYED")
                .body("CMN → LYS delayed by 45 minutes")
                .flightId(4L)
                .read(false)
                .build());

        notificationRepository.save(Notification.builder()
                .type(NotificationType.PASSENGER_ASSIGNED)
                .title("Passenger assigned")
                .body("M. Alaoui assigned to seat 14C on AT200")
                .flightId(1L)
                .read(false)
                .build());

        notificationRepository.save(Notification.builder()
                .type(NotificationType.HIGH_OCCUPANCY)
                .title("High occupancy alert")
                .body("AT201 CMN → JFK crossed 90% occupancy")
                .flightId(2L)
                .read(false)
                .build());
    }
}
