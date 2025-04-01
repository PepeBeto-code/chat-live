package com.chatlive.chatLive.mappers;

import com.chatlive.chatLive.dto.ChatResponseDto;
import com.chatlive.chatLive.models.Chat;
import com.chatlive.chatLive.models.ChatUser;
import com.chatlive.chatLive.models.User;
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

    @Named("mapParticipantList")
    default List<com.chatlive.chatLive.dto.User> mapParticipantList(List<ChatUser> participants) {
        if (participants != null) return participants.stream()
                .map(user1 -> com.chatlive.chatLive.dto.User.builder()
                        .username(user1.getUser().getUsername())
                        .id(user1.getUser().getId())
                        .build())
                .collect(Collectors.toList());

        return null;
    }

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

