package com.chat.api.validations;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
        // Inicialización si es necesaria
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }
        // Lógica de validación: longitud mínima, caracteres especiales, mayúsculas, etc.
        // password.length() >= 8 && password.matches(".*[A-Z].*") && password.matches(".*\\d.*");
        return  true;
    }
}

