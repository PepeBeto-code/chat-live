package com.chat.api.services;

import com.chat.api.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final UserDetailsService userDetailsService;

    private String secretKey = "naBAHSDHSDHhbbdg73trgedggdgedegjhjagssywg2wh2jshhsjwhs";

    public String getToken(UserDetails user) {
        return getToken(new HashMap<>(), user);
    }

    private String getToken(Map<String, Object> kvHashMap, UserDetails user) {
        return Jwts.builder()
                .setClaims(kvHashMap) // Aquí se agregan los claims personalizados
                .setSubject(user.getUsername())  // El nombre de usuario es el 'subject' del token
                .setIssuedAt(new Date())         // Fecha de emisión
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60)) // Expiración del token (1 hora en este caso)
                .signWith(getKey(),SignatureAlgorithm.HS256) // Algoritmo de firma y la clave secreta
                .compact();
    }

    private Key getKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUsernameFromToken(String token) {
        try {
            return getClaim(token, Claims::getSubject);
        } catch (ExpiredJwtException e) {
            return e.getClaims().getSubject(); // Extraer el username incluso si el token expiró
        } catch (JwtException e) {
            throw new IllegalArgumentException("Error al procesar el token: " + e.getMessage(), e);
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username=getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername())&& !isTokenExpired(token));
    }

    private Claims getAllClaims(String token)
    {
        return Jwts
                .parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T getClaim(String token, Function<Claims,T> claimsResolver)
    {
        final Claims claims=getAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Date getExpiration(String token)
    {
        return getClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token)
    {
        return getExpiration(token).before(new Date());
    }


    // Método para generar un refresh token (con más tiempo de expiración)
    public String generateRefreshToken(UserDetails user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7)) // 7 días
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public ResponseEntity<Map<String, String>> refreshAccessToken(String token){
        String username = getUsernameFromToken(token);

        if (username == null || username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid token or username"));
        }
        UserDetails userDetails=userDetailsService.loadUserByUsername(username);

        if (username.equals(userDetails.getUsername())){ 
            String newAccessToken = generateRefreshToken(userDetails);
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid refresh token"));
        }
    }

}
