package dev.c9tech.fabo.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String menuItemId;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal taxRate; // 0.00, 0.05, 0.08, 0.10

    private BigDecimal itemDiscount;

    @Column(nullable = false)
    private BigDecimal lineTotal;

    private String modifiersJson; // Toppings, sweetness, ice level

    private String note; // Ghi chú đặc biệt cho bếp

    @Enumerated(EnumType.STRING)
    private KitchenStatus kitchenStatus;

    public enum KitchenStatus {
        PENDING,
        COOKING,
        COMPLETED,
        CANCELLED
    }
}
