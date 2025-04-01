package com.chat.api.config.sprintwebsocket;

import com.chat.api.dto.User;
import com.chat.api.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Component
public class WebSocketInterceptor implements HandshakeInterceptor {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private static final ConcurrentHashMap<String, String> connectedUsers = new ConcurrentHashMap<>();

    @Override
    public boolean beforeHandshake(org.springframework.http.server.ServerHttpRequest request, org.springframework.http.server.ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        System.out.println("Nueva solicitud WebSocket:");
        System.out.println("URI: " + request.getURI());
        final String token = getTokenFromRequest(request);
        final String username=jwtService.getUsernameFromToken(token);

        UserDetails userDetails=userDetailsService.loadUserByUsername(username);

        com.chat.api.dto.User useDto = com.chat.api.dto.User.builder()
                .username(userDetails.getUsername())
                .build();


        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpServletRequest = servletRequest.getServletRequest();

            // Imprimir encabezados HTTP
            Enumeration<String> headerNames = httpServletRequest.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                System.out.println("Header: " + headerName + " -> " + httpServletRequest.getHeader(headerName));
            }

            // Imprimir parámetros de la solicitud
            Map<String, String[]> parameterMap = httpServletRequest.getParameterMap();
            parameterMap.forEach((key, values) -> {
                System.out.println("Parámetro: " + key + " -> " + String.join(", ", values));
            });
        }

        System.out.println("Nueva solicitud PERMITIDA:");


        return true;
    }

    @Override
    public void afterHandshake(org.springframework.http.server.ServerHttpRequest request, org.springframework.http.server.ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        System.out.println("Handshake completado con " + request.getURI());
    }  // ← Interceptor correcto

    private String getTokenFromRequest(ServerHttpRequest request) {

        // Primero buscar en los encabezados HTTP
        HttpHeaders headers = request.getHeaders();
        List<String> authHeaders = headers.get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String autHeader = authHeaders.get(0);
            if (StringUtils.hasText(autHeader) && autHeader.startsWith("Bearer ")) {
                return autHeader.substring(7);
            }
        }

        // Luego buscar en los parámetros de la URL para WebSocket
        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
            String tokenParam = servletRequest.getParameter("token");
            if (StringUtils.hasText(tokenParam)) {
                return tokenParam;
            }
        }
        return null;
    }
}
