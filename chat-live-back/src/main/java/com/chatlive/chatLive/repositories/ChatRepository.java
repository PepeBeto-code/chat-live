package com.chatlive.chatLive.repositories;

import com.chatlive.chatLive.enums.StatusChat;
import com.chatlive.chatLive.models.Chat;
import com.chatlive.chatLive.models.Message;
import com.chatlive.chatLive.models.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    //@EntityGraph(attributePaths = {"participants", "messages"})
    Optional<Chat> findById(Long id);
    void deleteByStatusChat(StatusChat statusChat);
    void deleteByStatusChatAndCreatedAtBefore(StatusChat statusChat, LocalDateTime createdAt);

    //Optional<Chat> findByParticipantsContainingAndParticipantsContaining(User user1, User user2);

    @Query("""
        SELECT c FROM Chat c
        WHERE c.id IN (
            SELECT cu.chat.id FROM ChatUser cu
            WHERE cu.user.id = :user1 OR cu.user.id = :user2
            GROUP BY cu.chat.id
            HAVING COUNT(DISTINCT cu.user.id) = 2
        )
    """)
    Optional<Chat> findByParticipantsContainingAndParticipantsContaining(@Param("user1") Integer user1, @Param("user2") Integer user2);

    @Query("""
    SELECT c
    FROM Chat c
    WHERE c.id IN (
        SELECT cu.chat.id
        FROM ChatUser cu
        GROUP BY cu.chat.id
        HAVING COUNT(cu.user.id) = 1
    )
    AND EXISTS (
        SELECT 1 FROM ChatUser cu2 WHERE cu2.chat.id = c.id AND cu2.user.id = :userId
    )
""")
    Optional<Chat> findChatsWithSingleUserByUserId(@Param("userId") Integer userId);

    /*
    @Query("SELECT ch FROM Chat ch WHERE ch.sender.id = :userId")
    List<Message> findChatsByUserId(Long userId);
    *
     */
}

