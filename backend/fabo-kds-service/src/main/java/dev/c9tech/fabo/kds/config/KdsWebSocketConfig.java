package dev.c9tech.fabo.kds.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class KdsWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // In-memory message broker with prefix /topic for broadcasts
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages sent from clients to server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register /ws-kds endpoint for frontend STOMP SockJS clients
        registry.addEndpoint("/ws-kds")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Plain WebSocket endpoint without SockJS fallback
        registry.addEndpoint("/ws-kds")
                .setAllowedOriginPatterns("*");
    }
}
