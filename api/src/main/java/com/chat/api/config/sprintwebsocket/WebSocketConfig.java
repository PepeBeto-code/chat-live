package com.chat.api.config.sprintwebsocket;

import com.chat.api.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.invocation.HandlerMethodArgumentResolver;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.authorization.AuthorizationEventPublisher;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.SpringAuthorizationEventPublisher;
import org.springframework.security.messaging.access.intercept.AuthorizationChannelInterceptor;
import org.springframework.security.messaging.context.AuthenticationPrincipalArgumentResolver;
import org.springframework.security.messaging.context.SecurityContextChannelInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.util.Enumeration;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtChannelInterceptor jwtChannelInterceptor;
    // private final DefaultHandshakeHandler defaultHandshakeHandler;
    private final WebSocketInterceptor webSocketInterceptor;
    private final ApplicationContext applicationContext;
    private final CsrfChannelInterceptor csrfChannelInterceptor;
    private final AuthorizationManager<Message<?>> authorizationManager;
    private final ConnectedUsersInterceptor connectedUsersInterceptor;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(connectedUsersInterceptor, csrfChannelInterceptor, jwtChannelInterceptor);
        AuthorizationChannelInterceptor authz = new AuthorizationChannelInterceptor(authorizationManager);
        AuthorizationEventPublisher publisher = new SpringAuthorizationEventPublisher(applicationContext);
        authz.setAuthorizationEventPublisher(publisher);
        registration.interceptors(new SecurityContextChannelInterceptor(), authz);
        System.out.println("Se registra el interceptor correctamente");

    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Activa un broker de mensajes en memoria para manejar los destinos
        config.enableSimpleBroker("/topic"); // Cliente se suscribe a "/topic"
        config.setApplicationDestinationPrefixes("/app"); // Cliente envía mensajes a "/app"
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Define el endpoint para WebSocket
        registry.addEndpoint("/chat-websocket")
                .setAllowedOrigins("http://client:3000", "http://localhost:3000", "https://chat-live-client.vercel.app")
                // .setHandshakeHandler(defaultHandshakeHandler) // Usa el handshake modificado
                // .addInterceptors(webSocketInterceptor)
                .withSockJS();
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new AuthenticationPrincipalArgumentResolver());
    }
}
