package com.chat.api.repositories;

import com.chat.api.models.PushSubscription;
import com.chat.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    Optional<PushSubscription> findFirstByUserOrderByIdDesc(User user); // Devuelve la última suscripción
    Optional<PushSubscription> findByUser(User user); // Devuelve todas las suscripciones de un usuario
}
