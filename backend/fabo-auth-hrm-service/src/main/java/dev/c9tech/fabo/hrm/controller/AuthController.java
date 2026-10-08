package dev.c9tech.fabo.hrm.controller;

import dev.c9tech.fabo.hrm.dto.LoginResponseDto;
import dev.c9tech.fabo.hrm.dto.PinLoginRequest;
import dev.c9tech.fabo.hrm.dto.ResponseAPI;
import dev.c9tech.fabo.hrm.dto.StaffDto;
import dev.c9tech.fabo.hrm.service.StaffAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth/pos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final StaffAuthService staffAuthService;

    @GetMapping("/staff-list")
    public ResponseAPI<List<StaffDto>> getStaffList(
            @RequestParam(defaultValue = "B01") String branchId
    ) {
        List<StaffDto> staffList = staffAuthService.getStaffList(branchId);
        ResponseAPI<List<StaffDto>> response = ResponseAPI.success(staffList);
        response.setRecordsTotal((long) staffList.size());
        return response;
    }

    @PostMapping("/pin-login")
    public ResponseAPI<LoginResponseDto> pinLogin(@RequestBody PinLoginRequest request) {
        try {
            LoginResponseDto result = staffAuthService.pinLogin(request);
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
