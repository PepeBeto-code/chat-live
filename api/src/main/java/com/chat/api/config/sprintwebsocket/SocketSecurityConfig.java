package com.chat.api.config.sprintwebsocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.messaging.DefaultSimpUserRegistry;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketSecurity
public class SocketSecurityConfig {
    @Bean
    AuthorizationManager<Message<?>> messageAuthorizationManager(
            MessageMatcherDelegatingAuthorizationManager.Builder messages) {
        return messages
                .simpTypeMatchers(SimpMessageType.CONNECT,
                   SimpMessageType.DISCONNECT).permitAll()
                .simpDestMatchers("/app/**").permitAll()  // Requiere autenticación para enviar mensajes
                .simpSubscribeDestMatchers("/topic/**").permitAll()  // Requiere autenticación para suscribirse
                .anyMessage().permitAll()  // Otros mensajes permitidos
                .build();

    }

 /*   @Bean
    public DefaultHandshakeHandler handshakeHandler() {
        return new DefaultHandshakeHandler() {
            @Override
            protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                                              Map<String, Object> attributes) {
                return (Principal) attributes.get("SPRING_SECURITY_CONTEXT"); // Usa el usuario guardado en el interceptor
            }
        };
    }

  */

   /*
    @Bean
    public SimpUserRegistry simpUserRegistry() {
        return new DefaultSimpUserRegistry();
    }
    */
}