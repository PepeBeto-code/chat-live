package com.chat.api.controllers;

import com.chat.api.models.PushSubscription;
import com.chat.api.models.User;
import com.chat.api.repositories.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.jose4j.lang.JoseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.chat.api.services.PushNotificationService;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushController {
    private final PushNotificationService pushNotificationService;

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@RequestBody PushSubscription subscription) {
        pushNotificationService.saveSubscription(subscription);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<String> unsubscribe() {
        pushNotificationService.unsubscribe();
        return new ResponseEntity<>("Subcripcion elimanada para el usuario", HttpStatus.NO_CONTENT);    }
}
