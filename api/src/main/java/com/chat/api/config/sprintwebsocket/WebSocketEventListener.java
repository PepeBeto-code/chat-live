package com.chat.api.config.sprintwebsocket;

import com.chat.api.mappers.UserMapper;
import com.chat.api.models.User;
import com.chat.api.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserMapper userMapper;
    private static final ConcurrentHashMap<String, com.chat.api.dto.User> connectedUsersConcurrent = new ConcurrentHashMap<>();

    // Método para manejar la conexión de un usuario
    @Transactional
    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        String userName = Objects.requireNonNull(event.getUser()).getName(); // Obtener el nombre del usuario conectado
        Optional<User> userOptional= userRepository.findByUsername(userName);
        User user = userOptional.isPresent() ? userRepository.findByUsername(userName).get() : null;

        if (user == null) return;

        user.setActive(true);
        userRepository.save(user);

        com.chat.api.dto.User useDto = userMapper.toDto(user);
        messagingTemplate.convertAndSend("/topic/users", useDto);
        if (connectedUsersConcurrent.putIfAbsent(user.getUsername(), useDto) != null) return;

        System.out.println("Usuario " + userName + " Se ha conectado");
    }

    /*
    @EventListener
    public void handleSubscription(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();

        assert destination != null;
        if (destination.equals("/topic/users")){
            System.out.println("📩 Enviamos un mensaje al canal: " +destination);
            messagingTemplate.convertAndSend("/topic/users", new HashSet<>(connectedUsersConcurrent.values()));
        }
        String sessionId = accessor.getSessionId();
        String username = accessor.getUser() != null ? accessor.getUser().getName() : "Unknown";

        System.out.println("📩 Usuario: " + username + " se suscribió a: " + destination + " (Sesión: " + sessionId + ")");
    }
    *
     */


    // Método para manejar la desconexión de un usuario
    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        String userName = Objects.requireNonNull(event.getUser()).getName(); // Obtener el nombre del usuario desconectado
        Optional<User> userOptional= userRepository.findByUsername(userName);
        User user = userOptional.isPresent() ? userRepository.findByUsername(userName).get() : null;

        if (user == null) return;

        connectedUsersConcurrent.entrySet().removeIf(entry -> entry.getKey().equals(userName));

        user.setActive(false);
        user.setLastConnection(LocalDateTime.now());
        userRepository.save(user);

        com.chat.api.dto.User useDto = userMapper.toDto(user);

        System.out.println("EL USUARIO "+userName+" SE DESCONECTA ");

        messagingTemplate.convertAndSend("/topic/users", useDto);  // Notificar a todos los clientes
    }

    public static boolean isUserOnline(String username) {
        return connectedUsersConcurrent.containsKey(username);
    }
}

