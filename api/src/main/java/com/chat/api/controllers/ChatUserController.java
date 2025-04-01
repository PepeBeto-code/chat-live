package com.chat.api.controllers;

import com.chat.api.dto.ChatRequestDto;
import com.chat.api.dto.ChatUserDto;
import com.chat.api.models.ChatUser;
import com.chat.api.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/chat-user")
@RequiredArgsConstructor
public class ChatUserController {
    private final ChatUserService chatUserService;

    @PostMapping("/mark-as-read")
    public ChatUserDto markMessagesAsRead(@RequestBody ChatUserDto chatUserDto){
        return chatUserService.resetUnreadMessages(chatUserDto.getChatId(),chatUserDto.getUserId());
    }

    @PutMapping("/{chatId}/{userId}/archived")
    public ResponseEntity<String> archiveChat(@PathVariable Long chatId,
                                              @PathVariable Integer userId,
                                              @RequestBody Map<String, Object> payload) {
            chatUserService.setArchivedStatusChat(chatId, userId, (Boolean) payload.get("value"));
            return new ResponseEntity<>("Chat user archived successfully", HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{chatId}/{userId}")
    public ResponseEntity<String> deleteChatUserById(@PathVariable Long chatId, @PathVariable Integer userId) {
            chatUserService.deleteChatUserById(chatId, userId);
            return new ResponseEntity<>("Chat user deleted successfully", HttpStatus.NO_CONTENT);
    }
}
