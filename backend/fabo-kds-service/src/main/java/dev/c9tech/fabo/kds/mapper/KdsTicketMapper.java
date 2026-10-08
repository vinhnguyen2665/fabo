package dev.c9tech.fabo.kds.mapper;

import dev.c9tech.fabo.kds.dto.KdsTicketDto;
import dev.c9tech.fabo.kds.dto.KdsTicketItemDto;

import java.util.*;
import java.util.stream.Collectors;

public class KdsTicketMapper {

    @SuppressWarnings("unchecked")
    public static KdsTicketDto fromMap(Map<String, Object> map) {
        if (map == null) {
            return null;
        }

        List<KdsTicketItemDto> items = new ArrayList<>();
        Object rawItems = map.get("items");
        if (rawItems instanceof List<?>) {
            for (Object obj : (List<?>) rawItems) {
                if (obj instanceof Map<?, ?>) {
                    Map<String, Object> itemMap = (Map<String, Object>) obj;
                    items.add(KdsTicketItemDto.builder()
                            .id((String) itemMap.get("id"))
                            .menuItemId((String) itemMap.get("menuItemId"))
                            .itemName((String) itemMap.get("itemName"))
                            .quantity(itemMap.get("quantity") instanceof Number ? ((Number) itemMap.get("quantity")).intValue() : 1)
                            .note((String) itemMap.get("note"))
                            .status((String) itemMap.get("status"))
                            .modifiersText((String) itemMap.get("modifiersText"))
                            .build());
                }
            }
        }

        return KdsTicketDto.builder()
                .orderId((String) map.get("orderId"))
                .branchId((String) map.get("branchId"))
                .tableId((String) map.get("tableId"))
                .tableName((String) map.get("tableName"))
                .orderTime((String) map.get("orderTime"))
                .status((String) map.get("status"))
                .items(items)
                .build();
    }

    public static List<KdsTicketDto> fromMapList(List<Map<String, Object>> mapList) {
        if (mapList == null) {
            return Collections.emptyList();
        }
        return mapList.stream().map(KdsTicketMapper::fromMap).collect(Collectors.toList());
    }
}
