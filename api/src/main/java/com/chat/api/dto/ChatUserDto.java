package com.chat.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserDto {
    private Integer userId;
    private Long chatId;
    private int unreadMessages; // Contador de mensajes no leídos
}
