package com.chat.api.mappers;

import com.chat.api.dto.ChatResponseDto;
import com.chat.api.models.Chat;
import com.chat.api.models.ChatUser;
import com.chat.api.models.User;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {UserMapper.class, MessageMapper.class})
public interface ChatMapper {
    @Mapping(target = "name", expression = "java(getChatName(chat, user))")
    @Mapping(target = "participants", source = "chat.participants", qualifiedByName = "mapParticipantList")
    @Mapping(target = "isVisible", source = "chat.visible")
    @Mapping(target = "isArchived", source = "chat.archived")
    ChatResponseDto toDto(Chat chat,@Context User user);
    ArrayList<ChatResponseDto> toDtoList(List<Chat> chats,@Context User user);

    default String getChatName(Chat chat,User user){
        if (chat.getName() != null) return chat.getName();

        Optional<ChatUser> optionalChatUser = chat.getParticipants().stream()
                .filter(chatUser1 -> !chatUser1.getUser().getUsername().equals(user.getUsername()))
                .findFirst();

        if (optionalChatUser.isPresent()) {
            return optionalChatUser.get().getUser().getUsername();
        }

        return chat.getParticipants().getFirst().getUser().getUsername();
    }
}

