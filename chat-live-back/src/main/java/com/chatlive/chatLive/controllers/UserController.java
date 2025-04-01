package com.chatlive.chatLive.controllers;

import com.chatlive.chatLive.dto.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import  com.chatlive.chatLive.services.UserService;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    public User createUser(@RequestBody com.chatlive.chatLive.models.User user) {
        return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public com.chatlive.chatLive.models.User getUser(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Otros endpoints según sea necesario
}
