package dev.c9tech.fabo.hrm.service.impl;

import dev.c9tech.fabo.hrm.dao.UserDAO;
import dev.c9tech.fabo.hrm.dto.LoginResponseDto;
import dev.c9tech.fabo.hrm.dto.PinLoginRequest;
import dev.c9tech.fabo.hrm.dto.StaffDto;
import dev.c9tech.fabo.hrm.entity.User;
import dev.c9tech.fabo.hrm.mapper.StaffMapper;
import dev.c9tech.fabo.hrm.service.StaffAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffAuthServiceImpl implements StaffAuthService {

    private final UserDAO userDAO;

    @Override
    public List<StaffDto> getStaffList(String branchId) {
        List<User> users = userDAO.findActiveUsersByBranch(branchId);
        return StaffMapper.toDtoList(users);
    }

    @Override
    public LoginResponseDto pinLogin(PinLoginRequest request) {
        log.info("Xác thực PIN cho nhân viên: {}", request.getStaffId());

        User user = userDAO.findById(request.getStaffId())
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại trong hệ thống"));

        if (user.getPinCode() == null || !user.getPinCode().equals(request.getPinCode())) {
            throw new IllegalArgumentException("Mã PIN không chính xác. Vui lòng thử lại");
        }

        StaffDto staffDto = StaffMapper.toDto(user);
        String token = "FABO-POS-JWT-" + UUID.randomUUID();

        return LoginResponseDto.builder()
                .token(token)
                .staff(staffDto)
                .shiftId("SHIFT-LANDMARK-" + System.currentTimeMillis() % 10000)
                .shiftName("Ca Sáng (06:30 - 14:30)")
                .loginTime(LocalDateTime.now().toString())
                .build();
    }
}
