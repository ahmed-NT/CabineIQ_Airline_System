package com.royalairmaroc.notification.dto;

import com.royalairmaroc.notification.entity.NotificationType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationDTO {

    private NotificationType type;
    private String title;
    private String body;
    private Long flightId;
}
