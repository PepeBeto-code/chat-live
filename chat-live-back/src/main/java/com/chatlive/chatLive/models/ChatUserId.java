package com.chatlive.chatLive.models;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@RequiredArgsConstructor
public class ChatUserId implements Serializable {
    private Long chatId;
    private Integer userId;

    public ChatUserId(Long chatId, Integer userId) {
        this.chatId = chatId;
        this.userId = userId;
    }
}

