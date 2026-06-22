package com.royalairmaroc.notification.controller;

import com.royalairmaroc.notification.dto.CreateNotificationDTO;
import com.royalairmaroc.notification.dto.NotificationDTO;
import com.royalairmaroc.notification.service.EmailService;
import com.royalairmaroc.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> create(@RequestBody CreateNotificationDTO dto) {
        return new ResponseEntity<>(notificationService.create(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    /** Internal endpoint: send email notification. Called by other services. */
    @PostMapping("/send-email")
    public ResponseEntity<Void> sendEmail(@RequestBody Map<String, String> body) {
        String to = body.get("to");
        String subject = body.get("subject");
        String text = body.get("body");
        if (to == null || subject == null || text == null) {
            return ResponseEntity.badRequest().build();
        }
        emailService.sendEmail(to, subject, text);
        return ResponseEntity.ok().build();
    }
}
