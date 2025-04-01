package com.chat.api.validations;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
// La anotación personalizada que se usa para validar los códigos de invitación
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = InvitationCodeValidator.class) // Especificamos el validador
public @interface ValidInvitationCode {

    String message() default "Código de invitación no válido"; // Mensaje por defecto si falla la validación

    Class<?>[] groups() default {}; // Grupos de validación

    Class<? extends Payload>[] payload() default {}; // Información adicional
}
