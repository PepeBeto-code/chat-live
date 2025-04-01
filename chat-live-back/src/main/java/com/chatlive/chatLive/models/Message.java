package com.chatlive.chatLive.models;

import com.chatlive.chatLive.enums.MessageStatus;
import com.chatlive.chatLive.enums.StatusChat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    @ManyToOne
    @JoinColumn(name = "replied_message_id", referencedColumnName = "id", nullable = true)
    private Message repliedMessage;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "seen_at")
    private LocalDateTime seenAt;

    private String content;
    private LocalDateTime timestamp;
    private String messageType;

}
