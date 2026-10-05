package dev.c9tech.fabo.hrm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {

    @Id
    private String id;

    @Column(nullable = false)
    private String brandId;

    @Column(nullable = false)
    private String name;

    private String address;
    private String phone;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
