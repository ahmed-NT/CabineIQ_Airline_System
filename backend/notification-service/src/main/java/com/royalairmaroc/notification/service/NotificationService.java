package com.royalairmaroc.notification.service;

import com.royalairmaroc.notification.dto.CreateNotificationDTO;
import com.royalairmaroc.notification.dto.NotificationDTO;
import com.royalairmaroc.notification.entity.Notification;
import com.royalairmaroc.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDTO> getAll() {
        return notificationRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    public NotificationDTO create(CreateNotificationDTO dto) {
        Notification notification = Notification.builder()
                .type(dto.getType())
                .title(dto.getTitle())
                .body(dto.getBody())
                .flightId(dto.getFlightId())
                .read(false)
                .build();
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead() {
        notificationRepository.findAll().forEach(n -> n.setRead(true));
    }

    @Transactional
    public NotificationDTO markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        notification.setRead(true);
        return toDto(notification);
    }

    private NotificationDTO toDto(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .body(n.getBody())
                .read(n.getRead())
                .flightId(n.getFlightId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
