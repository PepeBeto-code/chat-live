package com.chatlive.chatLive.services;

import com.chatlive.chatLive.repositories.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.chatlive.chatLive.enums.StatusChat;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatCleanupService {
    private final ChatRepository chatRepository;
    // Ejecuta la limpieza cada día a las 3:00 AM
    @Scheduled(cron = "0 */30 * * * ?") // Ejecuta cada 30 minutos
    public void deleteOldPendingChats() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(30);
        chatRepository.deleteByStatusChatAndCreatedAtBefore(StatusChat.PENDIENTE, limite);
        System.out.println("Chats 'PENDIENTE' creados hace más de 30 minutos eliminados.");
    }

}
