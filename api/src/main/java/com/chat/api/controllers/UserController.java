package com.chat.api.controllers;

import com.chat.api.dto.UpdateUserRequest;
import com.chat.api.dto.User;
import com.chat.api.services.ValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import  com.chat.api.services.UserService;
import java.util.Map;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final ValidationService validationService;
    @PostMapping
    public User createUser(@RequestBody com.chat.api.models.User user) {
        return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public com.chat.api.models.User getUser(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,  @Valid @RequestBody UpdateUserRequest request,
                           BindingResult bindingResult) {
        Map<String, String> validationErrors = validationService.getValidationErrors(bindingResult);
        if (!validationErrors.isEmpty()) {
            return ResponseEntity.badRequest().body(validationErrors);
        }

        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<?> updateUserActive(@PathVariable Integer id, @RequestBody UpdateUserRequest request) {
        userService.updateUserActive(id, request);
        return ResponseEntity.ok("Estado de conexion actualizado");
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Otros endpoints según sea necesario
}
