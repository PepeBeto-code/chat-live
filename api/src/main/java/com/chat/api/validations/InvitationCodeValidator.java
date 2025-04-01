package com.chat.api.validations;

import com.chat.api.models.Invitation;
import com.chat.api.repositories.InvitationRepository;
import java.util.Optional;
import jakarta.validation.ConstraintValidator;
import org.springframework.stereotype.Component;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class InvitationCodeValidator implements ConstraintValidator<ValidInvitationCode, String> {

    private final InvitationRepository invitationRepository;

    // Constructor para inyectar el repositorio de invitaciones
    public InvitationCodeValidator(InvitationRepository invitationRepository) {
        this.invitationRepository = invitationRepository;
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return false; // El valor es obligatorio
        }

        // Buscar la invitación por código
        Optional<Invitation> invitation = invitationRepository.findByCode(value);

        if (invitation.isEmpty()) {
            return false; // Código de invitación no existe
        }

        Invitation invitationEntity = invitation.get();

        // Validar si el código ha sido usado
        if (invitationEntity.isUsed()) {
            return false; // Código de invitación ya ha sido usado
        }

        // Validar si el código ha expirado
        if (invitationEntity.getExpirationDate().before(new java.util.Date())) {
            return false; // El código ha expirado
        }

        invitationEntity.setUsed(true);
        invitationRepository.save(invitationEntity);

        return true; // El código es válido
    }
}
