package com.campusconnect.booking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret:CampusConnectSecretKeyForJwtSigningMustBeAtLeast256BitsLong2026!}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String userIdHeader = request.getHeader("X-User-Id");
            String userRoleHeader = request.getHeader("X-User-Role");
            String userEmailHeader = request.getHeader("X-User-Email");
            String userNameHeader = request.getHeader("X-User-Name");

            if (StringUtils.hasText(userIdHeader) && StringUtils.hasText(userRoleHeader)) {
                UserContext userContext = UserContext.builder()
                        .id(Long.parseLong(userIdHeader))
                        .role(userRoleHeader)
                        .email(userEmailHeader)
                        .name(StringUtils.hasText(userNameHeader) ? userNameHeader : userEmailHeader)
                        .build();

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userContext, null, userContext.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                String bearerToken = request.getHeader("Authorization");
                if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
                    String token = bearerToken.substring(7);
                    SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                    Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();

                    Long userId = Long.parseLong(claims.getSubject());
                    String role = claims.get("role", String.class);
                    String email = claims.get("email", String.class);
                    String name = claims.get("name", String.class);

                    UserContext userContext = UserContext.builder()
                            .id(userId)
                            .role(role)
                            .email(email)
                            .name(name != null ? name : email)
                            .build();

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userContext, null, userContext.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to set authentication from token: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
