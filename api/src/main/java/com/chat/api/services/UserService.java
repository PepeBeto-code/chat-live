package com.chat.api.services;

import com.chat.api.dto.UpdateUserRequest;
import com.chat.api.dto.User;
import com.chat.api.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chat.api.dto.AuthResponse;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.chat.api.repositories.UserRepository;
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final SimpMessagingTemplate messagingTemplate;

    public User createUser(com.chat.api.models.User user) {
        //user.setCreatedAt(LocalDateTime.now());
        com.chat.api.models.User userOut = userRepository.save(user);
        return User.builder().id(user.getId()).username(user.getUsername())
                .role(user.getRole().name()).build();
    }

    public Optional<com.chat.api.models.User> findByUsername(String username){
        return userRepository.findByUsername(username);
    }

    public AuthResponse updateUser(Integer idUser,UpdateUserRequest request){
        com.chat.api.models.User user = userRepository.findById(idUser)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + idUser));
        user.setUsername(request.getUsername());
        userRepository.save(user);
        return generateAuthResponse(user);
    }

    public void updateUserActive(Integer idUser,UpdateUserRequest request){
        com.chat.api.models.User user = userRepository.findById(idUser)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + idUser));
        user.setActive(request.getActive());
        userRepository.save(user);
        messagingTemplate.convertAndSend("/topic/users", userMapper.toDto(user));
    }

    public com.chat.api.models.User getUserById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<com.chat.api.models.User> getUsersByIds(Set<Integer> userIds) {
        return new ArrayList<>(userRepository.findAllById(userIds));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll().stream().map((user -> User.builder()
                .username(user.getUsername())
                .active(user.getActive())
                .id(user.getId())
                .build())).collect(Collectors.toList());
    }

    // Método reutilizable para generar el AuthResponse
    private AuthResponse generateAuthResponse(com.chat.api.models.User user) {
        String token = jwtService.getToken(user);
        com.chat.api.dto.User userOut = userMapper.toDto(user);

        return AuthResponse.builder()
                .token(token)
                .user(userOut)
                .build();
    }

}

