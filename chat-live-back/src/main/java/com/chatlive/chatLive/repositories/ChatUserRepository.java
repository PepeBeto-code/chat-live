package com.chatlive.chatLive.repositories;

import com.chatlive.chatLive.models.ChatUser;
import com.chatlive.chatLive.models.ChatUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatUserRepository extends JpaRepository<ChatUser, ChatUserId> {

    // Obtener la lista de usuarios de un chat
    List<ChatUser> findByChatId(Long chatId);

    // Buscar un usuario en un chat específico
    ChatUser findByChatIdAndUserId(Long chatId, Integer userId);
}
