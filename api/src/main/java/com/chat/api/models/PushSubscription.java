package com.chat.api.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import nl.martijndwars.webpush.Subscription;

@Entity
@Table(
        name = "push_subscriptions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "endpoint"})
)
@Data
public class PushSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String expirationTime;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500) // Aumentamos el tamaño
    private String endpoint;

    @Column(nullable = false, length = 500)
    private String p256dh;
    @Column(nullable = false, length = 500)
    private String auth;
}

