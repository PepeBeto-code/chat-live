package com.chatlive.chatLive.config.sprintwebsocket;

import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.web.csrf.DefaultCsrfToken;

import org.springframework.security.crypto.codec.Utf8;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.InvalidCsrfTokenException;
import org.springframework.security.web.csrf.MissingCsrfTokenException;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.security.MessageDigest;
import java.security.Principal;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Base64;

@Component
@RequiredArgsConstructor
@Order(2)
public class CsrfChannelInterceptor implements ChannelInterceptor {


    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        System.out.println("🔹 Entramos al interceptor PRIMER interceptor con comando"+ accessor.getCommand());

        // Crear un token CSRF
        String tokenValue = "my-secret-token";  // Genera un valor de token seguro y único aquí.
        CsrfToken csrfToken = new DefaultCsrfToken("X-CSRF-TOKEN", "csrfToken", tokenValue);

        // Generar el actualToken basado en expectedToken.getToken()
        byte[] randomBytes = new byte[csrfToken.getToken().length()];
        new SecureRandom().nextBytes(randomBytes);
        byte[] csrfBytes = Utf8.encode(csrfToken.getToken());
        byte[] xoredCsrf = xorCsrf(randomBytes, csrfBytes);

// Concatenar los bytes aleatorios y el XOR
        byte[] actualBytes = new byte[randomBytes.length + xoredCsrf.length];
        System.arraycopy(randomBytes, 0, actualBytes, 0, randomBytes.length);
        System.arraycopy(xoredCsrf, 0, actualBytes, randomBytes.length, xoredCsrf.length);

// Codificar en Base64 URL-safe
        String actualToken = Base64.getUrlEncoder().withoutPadding().encodeToString(actualBytes);


        accessor.setSessionAttributes(Collections.singletonMap(CsrfToken.class.getName(), csrfToken));
        accessor.setNativeHeader(csrfToken.getHeaderName(), actualToken);


        // Devuelve el mensaje modificado para que sea utilizado en los siguientes interceptores
        return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());    }

    private static byte[] xorCsrf(byte[] randomBytes, byte[] csrfBytes) {
        Assert.isTrue(randomBytes.length == csrfBytes.length, "arrays must be equal length");
        int len = csrfBytes.length;
        byte[] xoredCsrf = new byte[len];
        System.arraycopy(csrfBytes, 0, xoredCsrf, 0, len);
        for (int i = 0; i < len; i++) {
            xoredCsrf[i] ^= randomBytes[i];
        }
        return xoredCsrf;
    }

}


