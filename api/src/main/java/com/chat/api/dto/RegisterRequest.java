package com.chat.api.dto;

import com.chat.api.validations.UniqueUsername;
import com.chat.api.validations.ValidInvitationCode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @UniqueUsername
    @NotNull(message = "El nombre de usuario es obligatorio.")
    String username;
    @NotNull(message = "La contraseña es obligatoria.")
    String password;
    String firstname;
    String lastname;
    String telephone;
    @NotNull(message = "El código de invitación es obligatorio.")
    @ValidInvitationCode(message = "El código de invitación es inválido o ha expirado.")
    private String invitationCode;
}
