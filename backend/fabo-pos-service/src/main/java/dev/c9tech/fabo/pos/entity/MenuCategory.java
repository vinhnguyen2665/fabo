package dev.c9tech.fabo.pos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuCategory {

    @Id
    private String id;

    @Column(nullable = false)
    private String branchId;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    private Integer displayOrder = 0;

    @Builder.Default
    private Boolean isActive = true;
}
