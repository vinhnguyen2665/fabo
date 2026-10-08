package dev.c9tech.fabo.hrm.mapper;

import dev.c9tech.fabo.hrm.dto.StaffDto;
import dev.c9tech.fabo.hrm.entity.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class StaffMapper {

    public static StaffDto toDto(User user) {
        if (user == null) {
            return null;
        }
        String role = user.getRoleId() != null ? user.getRoleId().replace("ROLE_", "") : "CASHIER";
        return StaffDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .role(role)
                .branchId(user.getBranchId())
                .build();
    }

    public static List<StaffDto> toDtoList(List<User> users) {
        if (users == null) {
            return Collections.emptyList();
        }
        return users.stream().map(StaffMapper::toDto).collect(Collectors.toList());
    }
}
