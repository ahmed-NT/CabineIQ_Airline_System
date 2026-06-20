package com.royalairmaroc.notification.controller;

import com.royalairmaroc.notification.dto.CreateNotificationDTO;
import com.royalairmaroc.notification.dto.NotificationDTO;
import com.royalairmaroc.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

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
}
