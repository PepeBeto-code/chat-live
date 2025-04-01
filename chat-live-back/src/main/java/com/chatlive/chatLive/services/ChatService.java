package com.chatlive.chatLive.services;

import com.chatlive.chatLive.dto.ChatResponseDto;
import com.chatlive.chatLive.dto.MessageDto;
import com.chatlive.chatLive.mappers.ChatMapper;
import com.chatlive.chatLive.models.*;
import com.chatlive.chatLive.repositories.ChatUserRepository;
import com.chatlive.chatLive.repositories.MessageRecipientRepository;
import com.chatlive.chatLive.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chatlive.chatLive.enums.StatusChat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import  com.chatlive.chatLive.repositories.ChatRepository;
@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private  final UserRepository userRepository;
    private final ChatUserRepository chatUserRepository;
    private final MessageRecipientRepository messageRecipientRepository;
    private final ChatMapper chatMapper;

    public ChatResponseDto getOrCreateChat(Integer senderId, Integer receiverId) {
        User sender = userRepository.findById(senderId).get();
        User receiver = userRepository.findById(receiverId).get();

        Optional<Chat> existingChat;

        if (senderId.equals(receiverId)) {
            // Buscar si ya existe un chat consigo mismo
            existingChat = chatRepository.findChatsWithSingleUserByUserId(senderId);
        } else {
            // Buscar un chat entre dos usuarios distintos
            existingChat = chatRepository.findByParticipantsContainingAndParticipantsContaining(sender.getId(), receiver.getId());
        }

        // Buscar si ya existe un chat entre los dos usuarios
        Chat chat = existingChat.orElseGet(() -> {

            Chat newChat  = new Chat();
            newChat .setCreatedAt(LocalDateTime.now());

            List<ChatUser> participants = new ArrayList<>();

            // Agregamos al primer participante del chat (Sender)
            ChatUser chatUserSender = new ChatUser();
            chatUserSender.setId(new ChatUserId(newChat.getId(), sender.getId())); // Establecer la clave compuesta
            chatUserSender.setUser(sender);
            chatUserSender.setUnreadMessages(0);
            chatUserSender.setChat(newChat);
            participants.add(chatUserSender);

            // Agregamos al segundo participante (Receiver) si es diferente del sender
            if (!senderId.equals(receiverId)){
                ChatUser chatUserReceive = new ChatUser();
                chatUserReceive.setId(new ChatUserId(newChat.getId(), receiver.getId())); // Establecer la clave compuesta
                chatUserReceive.setUser(receiver);
                chatUserReceive.setUnreadMessages(0);
                chatUserReceive.setChat(newChat);
                participants.add(chatUserReceive);
            }

            // Asignar participantes al chat y guardar
            newChat.setParticipants(participants);
            return chatRepository.save(newChat);
        });

        return chatMapper.toDto(chat, sender);
    }

    public List<ChatResponseDto> getChatsByAuthenticatedUser() {

        User user = getAuthenticatedUser();

        System.out.println("El user: "+user.getChats());

        List<Chat> chats = user.getChats().stream()
                .filter(ChatUser::isVisible)
                .peek(chatUser -> chatUser.getChat().setArchived(chatUser.isArchived()))
                .map(ChatUser::getChat)
                .peek(chat -> chat.setVisible(true))
                .collect(Collectors.toList());
        System.out.println("Los chats: "+user.getChats().stream().collect(Collectors.toList()));
        return chatMapper.toDtoList(chats, user);
    }

    public ChatResponseDto getChatById(Long id) {
        Chat chat = chatRepository.findById(id).orElse(null);
        User user = getAuthenticatedUser();
        ChatUser participant = chatUserRepository.findByChatIdAndUserId(id, user.getId());
        ChatResponseDto chatResponseDto = chatMapper.toDto(chat, participant.getUser());
        chatResponseDto.setMessages(chatResponseDto.getMessages().stream()
                        .filter(message -> {
                            System.out.println("IdMessage: "+message.getId()+" UserId: "+user.getId());
                            return  !messageRecipientRepository.isMessageDeletedForUser(message.getId(), user.getId());
                        })
                .filter(msg -> !participant.isDeleted() || msg.getTimestamp().isAfter(participant.getLastDeleted()))
                .toList());
        return  chatResponseDto;
    }

    @Scheduled(cron = "0 */30 * * * ?") // Cada 30 minutos
    public void deleteOldPendingChats() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(30);
        chatRepository.deleteByStatusChatAndCreatedAtBefore(StatusChat.PENDIENTE, limite);
        System.out.println("Chats 'PENDIENTE' creados hace más de 30 minutos eliminados.");
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return  userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found"));

    }
}

