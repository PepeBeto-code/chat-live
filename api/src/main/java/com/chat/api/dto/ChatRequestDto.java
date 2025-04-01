package com.chat.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequestDto {
    private Integer senderId;
    private Integer receiverId;
}

