package com.chatlive.chatLive.config.sprintwebsocket;

import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
        import org.springframework.messaging.MessageChannel;
        import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
        import org.springframework.messaging.support.ChannelInterceptor;
        import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(1)
public class ConnectedUsersInterceptor implements ChannelInterceptor {

    private static final ConcurrentHashMap<String, ConcurrentHashMap<String,String>> connectedUsers = new ConcurrentHashMap<>();

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        String username = accessor.getUser() != null ? accessor.getUser().getName() : "Unknown";
        String destination = accessor.getDestination();
        String sessionId = accessor.getSessionId();

        System.out.println("Este es el userName: "+username+ " Y este el destino: "+destination);
        /*
        switch (accessor.getCommand()) {
            case SUBSCRIBE:

                // Usar putIfAbsent para asegurar que solo se agregue el destino si no existe
                ConcurrentHashMap<String, String> data = connectedUsers.putIfAbsent(destination, new ConcurrentHashMap<>());
                if (data != null) {
                    // Ya existe, intentamos agregar el usuario
                    if (data.putIfAbsent(sessionId, username) != null) {
                        // El usuario ya estaba en la sesión
                        return null; // No hacer nada si ya está suscrito
                    }
                } else {
                    // Si no existe la entrada, agregar el usuario
                    connectedUsers.get(destination).put(sessionId, username);
                }
                break;

            case UNSUBSCRIBE:
                String sessionIdDsc = accessor.getSessionId();
                String usernameDsc = accessor.getUser() != null ? accessor.getUser().getName() : "Unknown";

                if (sessionIdDsc == null || destination == null) {
                    // Si sessionIdDsc es null, no hacer nada
                    return message;
                }

                ConcurrentHashMap<String, String> dataDsc = connectedUsers.get(destination);
                if (dataDsc != null) {
                    // Si el usuario está conectado, eliminarlo
                    String disconnectedUser = dataDsc.remove(sessionIdDsc);
                    if (disconnectedUser != null) {
                        System.out.println("❌ Usuario desconectado: " + disconnectedUser + " (Sesión: " + sessionIdDsc + ")");
                    }
                }
                break;

            case null:
                break;
            default:
                break;
        }
        */
        return message;
    }
}

