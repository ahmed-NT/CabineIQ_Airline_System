package com.royalairmaroc.notification.dto;

import com.royalairmaroc.notification.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private Long id;
    private NotificationType type;
    private String title;
    private String body;
    private Boolean read;
    private Long flightId;
    private LocalDateTime createdAt;
}
