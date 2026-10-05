package dev.c9tech.fabo.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/v1/payments/webhook",
            "/api/v1/payments/vietqr/generate",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/ws-kds"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Check if path is public
        boolean isPublic = PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
        if (isPublic) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Thiếu Bearer Token khi truy cập endpoint bảo mật: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        // Trong môi trường production, verify JWT signature và decode claims:
        // String userId = claims.getSubject();
        // String branchId = claims.get("branchId", String.class);
        // String roles = claims.get("roles", String.class);
        
        // Inject user headers downstream
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", "usr-pos-001")
                .header("X-Branch-Id", "branch-landmark81")
                .header("X-User-Roles", "CASHIER,STAFF")
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return -100; // Run early in the filter chain
    }
}
