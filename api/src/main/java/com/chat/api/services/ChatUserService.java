package com.chat.api.services;

import com.chat.api.dto.ChatUserDto;
import com.chat.api.models.ChatUser;
import com.chat.api.models.ChatUserId;
import com.chat.api.models.User;
import com.chat.api.repositories.ChatUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ChatUserService {

    private final ChatUserRepository chatUserRepository;
    private final UserService userService;

    public void deleteChatUserById(Long chatId, Integer userId) {
        ChatUser chatUser = getValidatedChatUser(chatId, userId);
        chatUser.setDeleted(true);
        chatUser.setVisible(false);
        chatUser.setLastDeleted(LocalDateTime.now());
        chatUserRepository.save(chatUser);
    }

    public void setArchivedStatusChat(Long chatId, Integer userId, boolean archived) {
        ChatUser chatUser = getValidatedChatUser(chatId, userId);
        chatUser.setArchived(archived);
        chatUserRepository.save(chatUser);
    }

    /**
     * Reinicia el contador de mensajes no leídos cuando un usuario abre un chat.
     */
    public ChatUserDto resetUnreadMessages(Long chatId, Integer userId){
        ChatUser chatUser = getValidatedChatUser(chatId, userId);
        chatUser.setUnreadMessages(0);
        chatUserRepository.save(chatUser);
        return ChatUserDto.builder()
                .chatId(chatUser.getChat().getId())
                .userId(chatUser.getUser().getId())
                .unreadMessages(chatUser.getUnreadMessages())
                .build();
    }

    /**
     * Incrementa el número de mensajes no leídos para todos los usuarios en el chat,
     * excepto para el que envió el mensaje.
     */
    @Transactional
    public void incrementUnreadMessages(Long chatId, Integer senderId) {
        getValidatedChatUser(chatId, senderId);
        List<ChatUser> chatUsers = chatUserRepository.findByChatId(chatId);

        for (ChatUser chatUser : chatUsers) {
            if (!chatUser.getUser().getId().equals(senderId)) {
                chatUser.setUnreadMessages(chatUser.getUnreadMessages() + 1);
                chatUserRepository.save(chatUser);
            }
        }
    }

    /**
     * Se actualiza el estado que indica si el chat sera visible o no
     */
    @Transactional
    public void updateStatusVisible(Long chatId, boolean isVisible) {
        List<ChatUser> chatUsers = chatUserRepository.findByChatId(chatId);

        for (ChatUser chatUser : chatUsers) {
                chatUser.setVisible(isVisible);
                chatUserRepository.save(chatUser);
        }
    }

    private ChatUser getValidatedChatUser(Long chatId, Integer userId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User userAuthenticate = userService.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found"));

        if (!userAuthenticate.getId().equals(userId)) {
            throw new IllegalStateException("Cannot modify a chat that is not yours.");
        }

        ChatUserId chatUserId = new ChatUserId(chatId, userId);
        return chatUserRepository.findById(chatUserId)
                .orElseThrow(() -> new NoSuchElementException("Chat not found with id: " + chatId));
    }
}
