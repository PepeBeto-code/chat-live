package com.chatlive.chatLive.services;

import com.chatlive.chatLive.dto.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.chatlive.chatLive.repositories.UserRepository;
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User createUser(com.chatlive.chatLive.models.User user) {
        //user.setCreatedAt(LocalDateTime.now());
        com.chatlive.chatLive.models.User userOut = userRepository.save(user);
        return User.builder().id(user.getId()).username(user.getUsername())
                .role(user.getRole().name()).build();
    }

    public Optional<com.chatlive.chatLive.models.User> findByUsername(String username){
        return userRepository.findByUsername(username);
    }

    public com.chatlive.chatLive.models.User getUserById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<com.chatlive.chatLive.models.User> getUsersByIds(Set<Integer> userIds) {
        return new ArrayList<>(userRepository.findAllById(userIds));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll().stream().map((user -> User.builder()
                .username(user.getUsername())
                .active(user.getActive())
                .id(user.getId())
                .build())).collect(Collectors.toList());
    }

}

