package com.chat.api.enums;

public enum MessageStatus {
    SENT,       // Enviado pero no recibido
    DELIVERED,  // Recibido por el destinatario
    SEEN        // Leído por el destinatario
}
