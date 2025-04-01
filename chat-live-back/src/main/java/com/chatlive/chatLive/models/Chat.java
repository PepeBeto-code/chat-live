package com.chatlive.chatLive.models;

import com.chatlive.chatLive.enums.StatusChat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "chats")
@Data
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChatUser> participants;


    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Message> messages;

    @Enumerated(EnumType.STRING)
    private StatusChat statusChat;

    // Campos que no se guardaran en la base de datos
    @Transient
    private Message lastMessage;
    @Transient
    private boolean isVisible;
    @Transient
    private boolean isArchived;

    public Message getLastMessage() {
        if (messages != null && !messages.isEmpty()) {
            // Ordenar los mensajes por timestamp y devolver el último
            return messages.stream()
                    .max((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                    .orElse(null); // Retorna null si no hay mensajes
        }
        return null;
    }

    // Método que se ejecuta antes de guardar el chat en la base de datos
    @PrePersist
    protected void onCreate() {
        if (statusChat == null) {
            statusChat = StatusChat.PENDIENTE; // Valor por defecto
        }
        createdAt = LocalDateTime.now(); // Guardar fecha de creación
    }

    // Personalizamos el toString() para evitar que acceda a chats
    @Override
    public String toString() {
        return "User{id=" + id + ", name='" + name + "', status=" + statusChat + "}";
    }
}

