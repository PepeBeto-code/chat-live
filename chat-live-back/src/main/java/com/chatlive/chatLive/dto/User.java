package com.chatlive.chatLive.dto;

import com.chatlive.chatLive.models.Chat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    //List<ChatResponseDto> chats;

}
