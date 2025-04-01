package com.chat.api.services;

import com.chat.api.dto.MessageDto;
import com.chat.api.enums.MessageStatus;
import com.chat.api.enums.StatusChat;
import com.chat.api.mappers.MessageMapper;
import com.chat.api.models.*;
import com.chat.api.repositories.ChatRepository;
import com.chat.api.repositories.MessageRecipientRepository;
import lombok.RequiredArgsConstructor;
import org.jose4j.lang.JoseException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import com.chat.api.repositories.MessageRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageService {
    private static final int EDIT_TIME_LIMIT_MINUTES = 5;
    private final MessageRepository messageRepository;
    private final MessageRecipientRepository messageRecipientRepository;
    private final UserService userService;
    private final ChatRepository chatRepository;
    private final ChatUserService chatUserService;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageMapper messageMapper;
    private final PushNotificationService pushNotificationService;

    public List<Message> getMessagesByChatIdAndUserId(Long chatId, Long userId) {
        return messageRepository.findMessagesByChatIdAndUserId(chatId, userId);
    }

    public List<Message> getMessagesByUserId(Long userId) {
        return messageRepository.findMessagesByUserId(userId);
    }

    @Transactional
    public MessageDto sendMessageAndUpdateUnread(Long chatId, Integer senderId, String content, String messageType,
            Long repliedMessageId) {

        Chat chat = chatRepository.findById(chatId).get();
        chat.setStatusChat(StatusChat.ACTIVO);
        User sender = userService.getUserById(senderId);

        Message repliedMessage = null;
        if (repliedMessageId != null) {
            repliedMessage = messageRepository.findById(repliedMessageId)
                    .orElseThrow(() -> new NoSuchElementException("Replied message not found"));
        }

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setMessageType(messageType);
        message.setStatus(MessageStatus.SENT);
        message.setTimestamp(LocalDateTime.now());
        message.setRepliedMessage(repliedMessage);
        chatRepository.save(chat);

        // Incrementar mensajes no leídos para los demás participantes
        chatUserService.incrementUnreadMessages(message.getChat().getId(), message.getSender().getId());

        // Hacemos visible el chat para todos los usuarios
        chatUserService.updateStatusVisible(message.getChat().getId(), true);

        messageRepository.save(message);

        // Agregamos destinatarios
        for (ChatUser chatUser : chat.getParticipants()) {
            MessageRecipient messageRecipient = new MessageRecipient();
            messageRecipient.setMessage(message);
            messageRecipient.setUser(chatUser.getUser());
            messageRecipient.setDeleted(false);
            messageRecipientRepository.save(messageRecipient);
        }

        // Enviamos notificacion de nuevo mensaje
        for (ChatUser chatUser : chat.getParticipants()) {
            pushNotificationService.getSubscription(chatUser.getUser()).ifPresent(subscription -> {
                try {
                    if (!chatUser.getUser().getId().equals(sender.getId())) {
                        pushNotificationService.sendNotification(subscription,
                                "Nuevo mensaje de " + sender.getUsername(), message.getContent());
                    }
                } catch (GeneralSecurityException | IOException | JoseException | ExecutionException
                        | InterruptedException e) {
                    System.err.println("Error al enviar notificación: " + e.getMessage());
                    throw new RuntimeException(e);
                }
            });
        }

        return messageMapper.toDto(message);
    }

    // Eliminar un mensaje solo para un usuario
    public void deleteMessage(Long messageId, Integer userId) {
        Optional<MessageRecipient> recipient = messageRecipientRepository.findByMessageIdAndUserId(messageId, userId);
        if (recipient.isPresent()) {
            recipient.get().setDeleted(true);
            messageRecipientRepository.save(recipient.get());
        }
    }

    // Eliminar un mensaje para todos y permanentemente
    public void deleteMessageForAll(Long messageId, Integer userId) {
        Message message = getValidatedMessage(messageId, userId);
        messageRecipientRepository.deleteByMessageId(message.getId());
        messageRepository.delete(message);
    }

    @Transactional
    public List<MessageDto> changeMessagesStatus(List<Long> messageIds, MessageStatus newStatus) {
        // 1️⃣ Obtener los mensajes por ID
        List<Message> messages = messageRepository.findByIdIn(messageIds);

        // 2️⃣ Cambiar el estado de cada mensaje y asigna la fecha de modificacion
        messages.forEach(message -> {
            message.setStatus(newStatus);
            if (newStatus.equals(MessageStatus.SEEN))
                message.setSeenAt(LocalDateTime.now());
            if (newStatus.equals(MessageStatus.DELIVERED))
                message.setDeliveredAt(LocalDateTime.now());
        });

        // 3️⃣ Guardar los mensajes actualizados
        List<Message> messagesOut = messageRepository.saveAll(messages);
        return messageMapper.toDtoList(messagesOut);
    }

    public List<MessageDto> getMessagesByChatId(Long chatId) {
        List<Message> messages = messageRepository.findMessagesByChatId(chatId);
        return messageMapper.toDtoList(messages);
    }

    @Transactional
    public void markAllMessagesAsDeliveredForAuthenticatedUser(MessageStatus newStatus) {
        // Obtener el usuario autenticado
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Actualizar el estado de los mensajes
        messageRepository.markMessagesAsDeliveredForUserChats(user.getId(), MessageStatus.SENT, newStatus);

        // Obtener los mensajes actualizados
        List<Message> updatedMessages = messageRepository.findUpdatedMessagesForUser(user.getId());

        // Agrupar mensajes por chatId
        Map<Long, List<Message>> messagesByChat = updatedMessages.stream()
                .collect(Collectors.groupingBy(m -> m.getChat().getId()));

        // Enviar los mensajes actualizados por WebSockets a cada chat
        messagesByChat.forEach((chatId, messages) -> messagingTemplate.convertAndSend(
                "/topic/chat/" + chatId + "/updateStatus/message", messages.stream().map(messageMapper::toDto)));
    }

    public MessageDto editMessage(Long messageId, String newContent, Integer userId) {
        System.out.println("aqi entramos");
        Message message = getValidatedMessage(messageId, userId);
        System.out.println("newContent: " + newContent);
        System.out.println("message: " + message);

        if (message != null) {
            // Verificar si sigue dentro del tiempo de edición permitido
            if (message.getEditable()
                    && message.getTimestamp().plusMinutes(EDIT_TIME_LIMIT_MINUTES).isAfter(LocalDateTime.now())) {
                message.setContent(newContent);
                message.setEdited(true);
            } else {
                message.setEditable(false); // Bloquea edición después del tiempo límite
            }
        }
        return messageMapper.toDto(message);
    }

    private Message getValidatedMessage(Long messageId, Integer userId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User userAuthenticate = userService.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Authenticated user not found"));

        if (!userAuthenticate.getId().equals(userId)) {
            throw new IllegalStateException("Cannot modify a Message that is not yours.");
        }

        return messageRepository.findById(messageId)
                .orElseThrow(() -> new NoSuchElementException("Message not found with id: " + messageId));
    }

}
