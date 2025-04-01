package com.chatlive.chatLive.controllers;

import com.chatlive.chatLive.dto.MessageDto;
import com.chatlive.chatLive.dto.StatusUpdateMessages;
import com.chatlive.chatLive.enums.MessageStatus;
import com.chatlive.chatLive.models.Message;
import com.chatlive.chatLive.services.ChatUserService;
import com.chatlive.chatLive.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import java.util.stream.Collectors;

import com.chatlive.chatLive.services.MessageService;
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
    public ResponseEntity<String> deleteMessageAll(@PathVariable Long messageId, @PathVariable Integer userId) {
        messageService.deleteMessageAll(messageId, userId);
        return new ResponseEntity<>("Mensaje eliminado para todos", HttpStatus.NO_CONTENT);
    }

    @GetMapping("/chat/{chatId}")
    public List<MessageDto> getMessagesByChatId(@PathVariable Long chatId) {
        return messageService.getMessagesByChatId(chatId);
    }
}

