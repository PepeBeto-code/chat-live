package com.chat.api.dto;

import com.chat.api.enums.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateMessages {
    List<Long> messageIds;
    MessageStatus newStatus;
}
