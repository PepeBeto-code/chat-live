package com.chat.api.dto;

import com.chat.api.validations.UniqueUsername;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @UniqueUsername
    String username;
    Boolean active;
}
