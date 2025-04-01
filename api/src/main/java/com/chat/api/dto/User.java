package com.chat.api.dto;

import com.chat.api.models.Chat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    Integer id;
    String username;
    String firstname;
    String lastname;
    String telephone;
    String role;
    Boolean active;
    Boolean notifications;
    LocalDateTime lastConnection;
    //List<ChatResponseDto> chats;

}
