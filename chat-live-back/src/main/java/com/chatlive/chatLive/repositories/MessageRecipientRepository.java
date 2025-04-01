package com.chatlive.chatLive.repositories;

import com.chatlive.chatLive.models.MessageRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRecipientRepository extends JpaRepository<MessageRecipient, Long> {
    @Query("SELECT m.isDeleted FROM MessageRecipient m WHERE m.message.id = :messageId AND m.user.id = :userId")
    boolean isMessageDeletedForUser(@Param("messageId") Long messageId, @Param("userId") Integer userId);

    Optional<MessageRecipient> findByMessageIdAndUserId(Long messageId, Integer userId);

    @Modifying
    @Query("DELETE FROM MessageRecipient mr WHERE mr.message.id = :messageId")
    void deleteByMessageId(@Param("messageId") Long messageId);

}

