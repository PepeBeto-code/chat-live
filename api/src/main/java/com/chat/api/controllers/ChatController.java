package com.chat.api.controllers;

import com.chat.api.dto.ChatRequestDto;
import com.chat.api.dto.ChatResponseDto;
import com.chat.api.models.User;
import com.chat.api.services.ChatService;
import com.chat.api.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import com.chat.api.models.Chat;
@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final UserService userService;

    @PostMapping("/start")
    public ChatResponseDto startChat(@RequestBody ChatRequestDto chatRequestDto) {
        return chatService.getOrCreateChat(chatRequestDto.getSenderId(), chatRequestDto.getReceiverId());
    }

    @GetMapping
    public List<ChatResponseDto> getChatsByAuthenticatedUser() {
            return chatService.getChatsByAuthenticatedUser();
    }


    @GetMapping("/{id}")
    public ChatResponseDto getChat(@PathVariable Long id ) {
        return chatService.getChatById(id);
    }

    // Otros endpoints según sea necesario
}
