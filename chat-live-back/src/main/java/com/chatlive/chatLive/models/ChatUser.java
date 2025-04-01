package com.chatlive.chatLive.models;

import com.chatlive.chatLive.enums.StatusChat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "participants")
@Data
public class ChatUser {

    @EmbeddedId
    private ChatUserId id; // Clave compuesta

    @ManyToOne
    @MapsId("chatId") // Relaciona con el campo "chatId" de ChatUserId
    @JoinColumn(name = "chat_id")
    private Chat chat;

    @ManyToOne
    @MapsId("userId") // Relaciona con el campo "userId" de ChatUserId
    @JoinColumn(name = "user_id")
    private User user;

    private boolean isDeleted;
    private boolean isVisible;
    private boolean isArchived;

    private LocalDateTime lastDeleted;

    private int unreadMessages = 0; // Contador de mensajes no leídos

    // Método que se ejecuta antes de guardar el participante del chat en la base de datos
    @PrePersist
    protected void onCreate() {
        isDeleted = false;
        isVisible = false;
        isArchived = false;
    }
}
