package com.chat.api.mappers;

import com.chat.api.dto.MessageDto;
import com.chat.api.models.Message;
import com.chat.api.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    @Mapping(target = "senderId", source = "message.sender.id")
    @Mapping(target = "repliedMessageId", source = "message.repliedMessage",qualifiedByName = "getRepliedMessageId")
    MessageDto toDto(Message message);
    List<MessageDto> toDtoList(List<Message> messages);

    @Named("getRepliedMessageId")
    default Long getRepliedMessageId(Message repliedMessage){
        return  repliedMessage != null ? repliedMessage.getId() : null;
    }
}

