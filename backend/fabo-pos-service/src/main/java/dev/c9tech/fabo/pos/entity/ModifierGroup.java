package dev.c9tech.fabo.pos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modifier_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModifierGroup {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    private Integer minSelect = 0;

    @Builder.Default
    private Integer maxSelect = 1;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "modifierGroupId")
    @Builder.Default
    private List<Modifier> options = new ArrayList<>();
}
