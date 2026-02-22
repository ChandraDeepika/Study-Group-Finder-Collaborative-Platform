package com.studygroup.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/");
    }

   @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain chain)
        throws ServletException, IOException {

    String header = request.getHeader("Authorization");

    if (header != null && header.startsWith("Bearer ")) {

        String token = header.substring(7);

        try {

            String username = jwtUtil.extractUsername(token);

            if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

                // ✅ VALIDATE TOKEN HERE
                if (jwtUtil.validateToken(token, username)) {

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }

        } catch (Exception e) {
            System.out.println("JWT ERROR: " + e.getMessage());
        }
    }

    chain.doFilter(request, response);
}
}