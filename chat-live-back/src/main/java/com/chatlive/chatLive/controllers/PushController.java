package com.chatlive.chatLive.controllers;

import com.chatlive.chatLive.models.PushSubscription;
import com.chatlive.chatLive.models.User;
import com.chatlive.chatLive.repositories.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.jose4j.lang.JoseException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.chatlive.chatLive.services.PushNotificationService;

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
}
