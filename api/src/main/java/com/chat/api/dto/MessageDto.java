package com.chat.api.dto;

import com.chat.api.enums.MessageStatus;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    Long chatId;
    Integer senderId;
    String content;
    String messageType;
    LocalDateTime timestamp;
     Boolean editable;
     Boolean edited;
    private Long repliedMessageId;
    private MessageStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime seenAt;
}
