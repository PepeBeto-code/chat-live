package com.chat.api.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Data
public class ErrorResponse {

    private String mensaje;
    private int codigo;
    private LocalDateTime timestamp;

}

