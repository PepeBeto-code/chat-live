package com.chat.api.dto;

import com.chat.api.models.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private Long id;
    private String name;
    private String statusChat;
    private LocalDateTime createdAt;
    private List<User> participants;
    private List<MessageDto> messages;
    private MessageDto lastMessage;
    private boolean isVisible;
    private boolean isArchived;
    private int unreadMessages = 0; // Contador de mensajes no leídos

}
