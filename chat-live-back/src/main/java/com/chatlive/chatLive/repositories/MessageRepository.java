package com.chatlive.chatLive.repositories;

import com.chatlive.chatLive.enums.MessageStatus;
import com.chatlive.chatLive.models.Message;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId")
    List<Message> findMessagesByChatId(@Param("chatId") Long chatId);

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.sender.id = :userId")
    List<Message> findMessagesByChatIdAndUserId(Long chatId, Long userId);

    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId")
    List<Message> findMessagesByUserId(Long userId);

    List<Message> findByIdIn(List<Long> messageIds);

    @Transactional
    @Modifying
    @Query("UPDATE Message m SET m.status = :newStatus, m.deliveredAt = CURRENT_TIMESTAMP "+
            "WHERE m.chat.id IN " +
            "(SELECT cu.chat.id FROM ChatUser cu WHERE cu.user.id = :userId) " +
            "AND m.sender.id <> :userId " +
            "AND m.status = :previousStatus")
    void markMessagesAsDeliveredForUserChats(Integer userId, MessageStatus previousStatus, MessageStatus newStatus);


    @Query("SELECT m FROM Message m WHERE m.chat.id IN " +
            "(SELECT cu.chat.id FROM ChatUser cu WHERE cu.user.id = :userId)")
    List<Message> findUpdatedMessagesForUser(Integer userId);

    @Transactional
    @Modifying
    @Query("UPDATE Message m SET m.status = :status WHERE m.id IN :messageIds")
    void updateStatusForMessages(List<Long> messageIds, MessageStatus status);
}
