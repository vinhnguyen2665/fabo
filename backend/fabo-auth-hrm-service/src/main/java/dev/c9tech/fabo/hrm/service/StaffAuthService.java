package dev.c9tech.fabo.hrm.service;

import dev.c9tech.fabo.hrm.dto.LoginResponseDto;
import dev.c9tech.fabo.hrm.dto.PinLoginRequest;
import dev.c9tech.fabo.hrm.dto.StaffDto;

import java.util.List;

public interface StaffAuthService {
    List<StaffDto> getStaffList(String branchId);
    LoginResponseDto pinLogin(PinLoginRequest request);
}
