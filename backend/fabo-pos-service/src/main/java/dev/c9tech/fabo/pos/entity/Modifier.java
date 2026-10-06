package dev.c9tech.fabo.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "modifiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Modifier {

    @Id
    private String id;

    @Column(nullable = false)
    private String modifierGroupId;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    private BigDecimal extraPrice = BigDecimal.ZERO;
}
