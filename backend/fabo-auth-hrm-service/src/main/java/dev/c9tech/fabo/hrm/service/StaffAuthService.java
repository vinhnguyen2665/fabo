package dev.c9tech.fabo.hrm.service;

import dev.c9tech.fabo.hrm.dto.PinLoginRequest;

import java.util.List;
import java.util.Map;

public interface StaffAuthService {
    List<Map<String, Object>> getStaffList(String branchId);
    Map<String, Object> pinLogin(PinLoginRequest request);
}
