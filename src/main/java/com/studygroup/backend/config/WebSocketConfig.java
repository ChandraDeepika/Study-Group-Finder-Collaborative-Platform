package com.studygroup.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;

import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure message broker
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // Enables simple in-memory broker for topics and private messages
        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{10000, 10000})
                .setTaskScheduler(heartbeatScheduler());

        // Prefix for messages bound for @MessageMapping
        config.setApplicationDestinationPrefixes("/app");

        // Prefix for user-specific messages
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Register STOMP endpoints for WebSocket handshake
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow frontend connections
                .withSockJS(); // SockJS fallback support
    }

    /**
     * Scheduler used for WebSocket heartbeat mechanism
     */
    @Bean
    public ThreadPoolTaskScheduler heartbeatScheduler() {

        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("wss-heartbeat-thread-");
        scheduler.initialize();

        return scheduler;
    }
}