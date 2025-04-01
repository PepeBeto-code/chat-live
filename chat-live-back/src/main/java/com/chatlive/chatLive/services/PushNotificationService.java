package com.chatlive.chatLive.services;

import com.chatlive.chatLive.models.PushSubscription;
import com.chatlive.chatLive.models.User;
import com.chatlive.chatLive.repositories.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class PushNotificationService {
    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserService userService;

    private PushService pushService;

    @PostConstruct
    private void init() throws GeneralSecurityException {
        System.out.println("privateKey: "+ privateKey);
        System.out.println("publicKey: "+ publicKey);
        try {
            this.pushService = new PushService(publicKey, privateKey);
        } catch (Exception e) {
            System.err.println("Error al inicializar PushService: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void saveSubscription(PushSubscription subscription) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found"));

        PushSubscription subscriptionUser = pushSubscriptionRepository.findByUser(user)
                .orElse(new PushSubscription());

        subscriptionUser.setUser(user);
        subscriptionUser.setEndpoint(subscription.getEndpoint());
        subscriptionUser.setKeys(subscription.getKeys());

        pushSubscriptionRepository.save(subscriptionUser);
    }

    public void sendNotification(PushSubscription subscription, String title, String message) throws GeneralSecurityException, IOException, JoseException, ExecutionException, InterruptedException {
        // Crea un objeto Subscription usando los datos de PushSubscription
        Subscription webPushSubscription = new Subscription(
                subscription.getEndpoint(),
                new Subscription.Keys(subscription.getKeys().getAuth(),subscription.getKeys().getP256dh()));

        Notification notification = new Notification(webPushSubscription, "{\"title\": \"" + title + "\", \"message\": \"" + message + "\"}");
        pushService.send(notification);
    }

    public Optional<PushSubscription> getSubscription(User user) {
        return pushSubscriptionRepository.findByUser(user);
    }
}

