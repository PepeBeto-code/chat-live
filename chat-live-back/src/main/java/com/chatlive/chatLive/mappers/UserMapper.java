package com.chatlive.chatLive.mappers;

import com.chatlive.chatLive.models.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    com.chatlive.chatLive.dto.User toDto(User user);
    List<com.chatlive.chatLive.dto.User> toDtoList(List<User> users);
}

