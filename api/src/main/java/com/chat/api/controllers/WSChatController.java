package com.chat.api.controllers;

import com.chat.api.dto.MessageDto;
import com.chat.api.dto.StatusUpdateMessages;
import com.chat.api.dto.UserMessagesUnreadCountDTO;
import com.chat.api.dto.Mensaje;
import com.chat.api.models.ChatUser;
import com.chat.api.models.Message;
import com.chat.api.models.User;
import com.chat.api.repositories.ChatRepository;
import com.chat.api.repositories.ChatUserRepository;
import com.chat.api.repositories.UserRepository;
import com.chat.api.services.MessageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;

@Controller
public class WSChatController {
    @Controller
    @RequiredArgsConstructor
    public class ChatController {
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private ChatRepository chatRepository;
        @Autowired
        private MessageService messageService;
        @Autowired
        private SimpMessagingTemplate messagingTemplate;
        @Autowired
        private ChatUserRepository chatUserRepository;

        @MessageMapping("/chat/{roomId}")  // Mensajes enviados desde el cliente a "/app/chat"
        @SendTo("/topic/messages/{roomId}")  // Se reenvía a todos los suscriptores en "/topic/messages"
        public MessageDto handleChat(@DestinationVariable Long roomId,
                                          @Payload MessageDto message,
                                          SimpMessageHeaderAccessor headerAccessor) {
            String username = Objects.requireNonNull(headerAccessor.getUser()).getName();

            MessageDto messageDto = messageService.sendMessageAndUpdateUnread(
                    roomId,
                    message.getSenderId(),
                    message.getContent(),
                    message.getMessageType(),
                    message.getRepliedMessageId());


            // Enviamos actualizacion de contadores de mensajes no leidos para cada participante en el chat
            notifyUsersUnreadMessages(roomId);

            return messageDto;
        }

        @MessageMapping("/chat/{roomId}/typing")  // Notificación de usuario escribiendo
        @SendTo("/topic/chat/{roomId}/typing")   // Se notifica a todos los suscriptores que alguien está escribiendo
        public Mensaje typing(
                @DestinationVariable Long roomId,
                SimpMessageHeaderAccessor headerAccessor) {
            String username = Objects.requireNonNull(headerAccessor.getUser()).getName();
            return new Mensaje(username, "");
        }

        @MessageMapping("/chat/{roomId}/updateStatus/message")  // Cliente actualiza el estado del mensaje
        @SendTo("/topic/chat/{roomId}/updateStatus/message")   // Se notifica a todos los suscriptores que el status de los mensajes a cambiado
        public List<MessageDto> updateStatus(@Payload StatusUpdateMessages statusUpdateMessages) {
            return messageService.changeMessagesStatus(statusUpdateMessages.getMessageIds(), statusUpdateMessages.getNewStatus());
        }

        private void notifyUsersUnreadMessages(Long roomId) {

            List<ChatUser> chatsUsers = chatUserRepository.findByChatId(roomId);

            List<UserMessagesUnreadCountDTO> userMessagesUnreadCountDTO = chatsUsers.stream()
                    .map(chatUser -> UserMessagesUnreadCountDTO.builder()
                            .userId(chatUser.getUser().getId())
                            .unreadMessages(chatUser.getUnreadMessages())
                            .build()).toList();

            // Aquí, se envia un mensaje de actuailzacion de contadores a todos los usuarios en el chat
            messagingTemplate.convertAndSend("/topic/chat/unread/" + roomId, userMessagesUnreadCountDTO);
        }
    }
}
