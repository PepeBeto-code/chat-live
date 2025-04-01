package com.chat.api.services;

import com.chat.api.dto.AuthResponse;
import com.chat.api.dto.ChatResponseDto;
import com.chat.api.dto.LoginRequest;
import com.chat.api.dto.RegisterRequest;
import com.chat.api.enums.Role;
import com.chat.api.mappers.UserMapper;
import com.chat.api.models.Chat;
import com.chat.api.models.User;
import com.chat.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        com.chat.api.dto.User userOut = userMapper.toDto(user);

        String token=jwtService.getToken(user);
        return AuthResponse.builder()
                .token(token)
                .user(userOut)
                .build();    }

    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .password(passwordEncoder.encode( request.getPassword()))
                .telephone(request.getTelephone())
                .role(Role.USER)
                .build();
        userRepository.save(user);

        return AuthResponse.builder()
                .token(jwtService.getToken(user)).build();
    }
}
