package com.chatlive.chatLive.controllers;

import com.chatlive.chatLive.dto.AuthResponse;
import com.chatlive.chatLive.dto.LoginRequest;
import com.chatlive.chatLive.dto.RegisterRequest;
import com.chatlive.chatLive.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.ObjectError;
import org.springframework.security.access.AccessDeniedException;

//import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, BindingResult bindingResult){
        if (bindingResult.hasErrors()) {
            // Procesar los errores de validación
            Map<String, String> errores = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errores.put(error.getField(), error.getDefaultMessage());
            }

            return ResponseEntity.badRequest().body(errores);
        }

        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (AccessDeniedException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Acceso denegado: No tienes permisos para acceder a este recurso.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }    }

    @PostMapping("/register")
    public  ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request){
        return ResponseEntity.ok(authService.register(request));
    }
}
