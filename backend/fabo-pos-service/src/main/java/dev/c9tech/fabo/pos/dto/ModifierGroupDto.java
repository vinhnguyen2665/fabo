package dev.c9tech.fabo.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModifierGroupDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private Integer minSelect;
    private Integer maxSelect;

    @Builder.Default
    private List<ModifierDto> options = new ArrayList<>();
}
