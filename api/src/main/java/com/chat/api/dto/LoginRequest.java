package com.chat.api.dto;

import com.chat.api.validations.ValidPassword;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotNull(message = "El nombre no puede ser nulo")
    @Size(min = 2, max = 20, message = "El nombre debe tener entre 2 y 20 caracteres")
    String username;

    @NotNull(message = "La contraseña no puede ser nula")
    @ValidPassword
    String password;
}
