package dev.c9tech.fabo.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String fullName;
    private String username;
    private String role;
    private String branchId;
}
