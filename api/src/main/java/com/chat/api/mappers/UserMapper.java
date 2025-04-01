package com.chat.api.mappers;

import com.chat.api.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;
import com.chat.api.models.ChatUser;

@Mapper(componentModel = "spring")
public interface UserMapper {
    com.chat.api.dto.User toDto(User user);
    List<com.chat.api.dto.User> toDtoList(List<User> users);

    @Named("mapParticipantList")
    default List<com.chat.api.dto.User> mapParticipantList(List<ChatUser> participants) {
        if (participants != null) return participants.stream()
                .map(chatUser -> toDto(chatUser.getUser()))
                .collect(Collectors.toList());

        return null;
    }
}

