package com.chatlive.chatLive.services;

import com.chatlive.chatLive.dto.AuthResponse;
import com.chatlive.chatLive.dto.ChatResponseDto;
import com.chatlive.chatLive.dto.LoginRequest;
import com.chatlive.chatLive.dto.RegisterRequest;
import com.chatlive.chatLive.enums.Role;
import com.chatlive.chatLive.models.Chat;
import com.chatlive.chatLive.models.User;
import com.chatlive.chatLive.repositories.UserRepository;
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

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        com.chatlive.chatLive.dto.User userOut = com.chatlive.chatLive.dto.User.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .telephone(user.getTelephone())
                .role(user.getRole().name())
                .build();

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
