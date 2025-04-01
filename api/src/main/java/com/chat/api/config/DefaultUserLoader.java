package com.chat.api.config;

import com.chat.api.enums.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.chat.api.models.User;
import com.chat.api.repositories.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DefaultUserLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DefaultUserLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        List<User> defaultUsers = new ArrayList<>();
        User pepe = new User();
        pepe.setUsername("pepe");
        pepe.setPassword(passwordEncoder.encode("Pepe123"));
        pepe.setRole(Role.USER);
        defaultUsers.add(pepe);

        User toño = new User();
        toño.setUsername("toño");
        toño.setPassword(passwordEncoder.encode("Tono123"));
        toño.setRole(Role.USER);
        defaultUsers.add(toño);

        for (User user : defaultUsers) {
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());

            if (existingUser.isEmpty()) {
                userRepository.save(user);
                System.out.println("Usuario creado: " + user.getUsername());
            } else {
                System.out.println("El usuario " + user.getUsername() + " ya existe.");
            }
        }
    }
}
