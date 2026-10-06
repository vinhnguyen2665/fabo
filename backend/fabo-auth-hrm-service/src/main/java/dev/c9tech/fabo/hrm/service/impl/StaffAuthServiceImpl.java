package dev.c9tech.fabo.hrm.service.impl;

import dev.c9tech.fabo.hrm.dao.UserDAO;
import dev.c9tech.fabo.hrm.dto.PinLoginRequest;
import dev.c9tech.fabo.hrm.entity.User;
import dev.c9tech.fabo.hrm.service.StaffAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffAuthServiceImpl implements StaffAuthService {

    private final UserDAO userDAO;

    @Override
    public List<Map<String, Object>> getStaffList(String branchId) {
        List<User> users = userDAO.findActiveUsersByBranch(branchId);
        return users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("username", u.getUsername());
            map.put("role", u.getRoleId() != null ? u.getRoleId().replace("ROLE_", "") : "CASHIER");
            map.put("branchId", u.getBranchId());
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> pinLogin(PinLoginRequest request) {
        log.info("Xác thực PIN cho nhân viên: {}", request.getStaffId());

        User user = userDAO.findById(request.getStaffId())
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại trong hệ thống"));

        if (user.getPinCode() == null || !user.getPinCode().equals(request.getPinCode())) {
            throw new IllegalArgumentException("Mã PIN không chính xác. Vui lòng thử lại");
        }

        String role = user.getRoleId() != null ? user.getRoleId().replace("ROLE_", "") : "CASHIER";
        String token = "FABO-POS-JWT-" + UUID.randomUUID();

        Map<String, Object> staffInfo = new HashMap<>();
        staffInfo.put("id", user.getId());
        staffInfo.put("fullName", user.getFullName());
        staffInfo.put("username", user.getUsername());
        staffInfo.put("role", role);
        staffInfo.put("branchId", user.getBranchId());

        return Map.of(
                "token", token,
                "staff", staffInfo,
                "shiftId", "SHIFT-LANDMARK-" + System.currentTimeMillis() % 10000,
                "shiftName", "Ca Sáng (06:30 - 14:30)",
                "loginTime", LocalDateTime.now().toString()
        );
    }
}
