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
public class LoginResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String token;
    private StaffDto staff;
    private String shiftId;
    private String shiftName;
    private String loginTime;
}
