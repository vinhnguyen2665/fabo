package dev.c9tech.fabo.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {

    @Id
    private String id;

    @Column(nullable = false)
    private String branchId;

    private String categoryId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Builder.Default
    private BigDecimal taxRate = BigDecimal.valueOf(0.08);

    private String imageUrl;

    @Builder.Default
    private Boolean isAvailable = true;

    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "menu_item_modifier_groups",
        joinColumns = @JoinColumn(name = "menu_item_id"),
        inverseJoinColumns = @JoinColumn(name = "modifier_group_id")
    )
    @Builder.Default
    private List<ModifierGroup> modifiers = new ArrayList<>();
}
