package dev.c9tech.fabo.hrm.controller;

import dev.c9tech.fabo.hrm.dto.PinLoginRequest;
import dev.c9tech.fabo.hrm.dto.ResponseAPI;
import dev.c9tech.fabo.hrm.service.StaffAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth/pos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final StaffAuthService staffAuthService;

    @GetMapping("/staff-list")
    public ResponseAPI<List<Map<String, Object>>> getStaffList(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        List<Map<String, Object>> staffList = staffAuthService.getStaffList(branchId);
        ResponseAPI<List<Map<String, Object>>> response = ResponseAPI.success(staffList);
        response.setRecordsTotal((long) staffList.size());
        return response;
    }

    @PostMapping("/pin-login")
    public ResponseAPI<Map<String, Object>> pinLogin(@RequestBody PinLoginRequest request) {
        try {
            Map<String, Object> result = staffAuthService.pinLogin(request);
            return ResponseAPI.success("Đăng nhập thành công", result);
        } catch (IllegalArgumentException e) {
            log.warn("Đăng nhập thất bại: {}", e.getMessage());
            return ResponseAPI.error(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi hệ thống khi đăng nhập: {}", e.getMessage(), e);
            return ResponseAPI.error(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ nội bộ");
        }
    }
}
