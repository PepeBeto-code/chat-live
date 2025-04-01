package com.chatlive.chatLive.models;

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
    private String endpoint;

    @Embedded
    private Keys keys;

    @Embeddable
    @Data
    public static class Keys {
        private String p256dh;
        private String auth;
    }
}

