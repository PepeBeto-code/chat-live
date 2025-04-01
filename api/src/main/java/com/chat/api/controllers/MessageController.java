package com.chat.api.controllers;

import com.chat.api.dto.MessageDto;
import com.chat.api.dto.StatusUpdateMessages;
import com.chat.api.enums.MessageStatus;
import com.chat.api.models.Message;
import com.chat.api.services.ChatUserService;
import com.chat.api.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import java.util.stream.Collectors;

import com.chat.api.services.MessageService;
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;
    private final UserService userService;
    private final ChatUserService chatUserService;

    @PostMapping("/send")
    public MessageDto sendMessage(@RequestBody MessageDto messageRequest) {
        return messageService.sendMessageAndUpdateUnread(messageRequest.getChatId(),
                messageRequest.getSenderId(),
                messageRequest.getContent(),
                messageRequest.getMessageType(),
                messageRequest.getRepliedMessageId());
    }

    @GetMapping("/chat/{chatId}/user/{userId}")
    public ResponseEntity<List<Message>> getMessagesByChatIdAndUserId(
            @PathVariable Long chatId,
            @PathVariable Long userId) {
        List<Message> messages = messageService.getMessagesByChatIdAndUserId(chatId, userId);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/mark-all-messages-delivered")
    public ResponseEntity<String> markAllMessagesAsDelivered() {
        messageService.markAllMessagesAsDeliveredForAuthenticatedUser(MessageStatus.DELIVERED);
        return ResponseEntity.ok("All messages marked as Delivered.");
    }

    @DeleteMapping("/{messageId}/user/{userId}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long messageId, @PathVariable Integer userId) {
        messageService.deleteMessage(messageId, userId);
        return new ResponseEntity<>("Mensaje eliminado para el usuario", HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{messageId}/user/{userId}/all")
    public ResponseEntity<String> deleteMessageForAll(@PathVariable Long messageId, @PathVariable Integer userId) {
        messageService.deleteMessageForAll(messageId, userId);
        return new ResponseEntity<>("Mensaje eliminado para todos", HttpStatus.NO_CONTENT);
    }
    
    @PutMapping("/editMessage/{messageId}/user/{userId}")
    public MessageDto editMessage(@PathVariable Long messageId,@RequestBody MessageDto request, @PathVariable Integer userId) {
        return messageService.editMessage(messageId, request.getContent(), userId);
    }

    @GetMapping("/chat/{chatId}")
    public List<MessageDto> getMessagesByChatId(@PathVariable Long chatId) {
        return messageService.getMessagesByChatId(chatId);
    }
}

