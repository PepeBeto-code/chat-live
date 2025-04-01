package com.chat.api.services;

import com.chat.api.models.PushSubscription;
import com.chat.api.models.User;
import com.chat.api.repositories.PushSubscriptionRepository;
import com.chat.api.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
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
    private final UserRepository userRepository;
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

    @Transactional
    public void saveSubscription(PushSubscription subscription) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found"));

        PushSubscription subscriptionUser = pushSubscriptionRepository.findByUser(user)
                .orElse(new PushSubscription());

        subscriptionUser.setUser(user);
        subscriptionUser.setEndpoint(subscription.getEndpoint());
        subscriptionUser.setAuth(subscription.getAuth());
        subscriptionUser.setP256dh(subscription.getP256dh());

        user.setNotifications(true);
        userRepository.save(user);

        pushSubscriptionRepository.save(subscriptionUser);
    }

    @Transactional
    public void unsubscribe() {
        // Obtener el nombre de usuario del contexto de seguridad
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Buscar el usuario autenticado
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found"));

        // Buscar la suscripción de push del usuario
        PushSubscription subscriptionUser = pushSubscriptionRepository.findByUser(user)
                .orElseThrow(() -> new NoSuchElementException("No push subscription found for the user"));

        user.setNotifications(false);
        userRepository.save(user);

        // Eliminar la suscripción de push
        pushSubscriptionRepository.delete(subscriptionUser);
    }

    public void sendNotification(PushSubscription subscription, String title, String message) throws GeneralSecurityException, IOException, JoseException, ExecutionException, InterruptedException {

        Notification notification = new Notification(
                subscription.getEndpoint(),
                subscription.getP256dh(),
                subscription.getAuth(),
                "{"
                        + "\"title\": \"" + title + "\", "
                        + "\"message\": \"" + message + "\", "
                        + "\"icon\": \"your_icon_url\""
                        + "}"
        );

        pushService.send(notification);
    }

    public Optional<PushSubscription> getSubscription(User user) {
        return pushSubscriptionRepository.findByUser(user);
    }
}

