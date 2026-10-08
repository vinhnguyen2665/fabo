package dev.c9tech.fabo.kds.dto;

import java.util.Arrays;

public enum KitchenStatus {
    PENDING,
    COOKING,
    COMPLETED,
    CANCELLED;

    public static KitchenStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Trạng thái vé (status) không được để trống");
        }
        for (KitchenStatus status : values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException(
                "Trạng thái vé '" + value + "' không hợp lệ. Các trạng thái hợp lệ: " + Arrays.toString(values())
        );
    }
}
