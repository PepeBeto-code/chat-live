package com.chatlive.chatLive.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMessagesUnreadCountDTO {
    private Integer userId;
    private int unreadMessages;
}
