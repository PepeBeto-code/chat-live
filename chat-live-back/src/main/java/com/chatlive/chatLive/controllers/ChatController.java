package com.chatlive.chatLive.controllers;

import com.chatlive.chatLive.dto.ChatRequestDto;
import com.chatlive.chatLive.dto.ChatResponseDto;
import com.chatlive.chatLive.models.User;
import com.chatlive.chatLive.services.ChatService;
import com.chatlive.chatLive.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import com.chatlive.chatLive.models.Chat;
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
