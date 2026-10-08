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
                    String modText = (String) itemMap.get("modifiersText");
                    if (modText == null || modText.isBlank()) {
                        Object rawMod = itemMap.get("modifiersJson");
                        if (rawMod instanceof String) {
                            modText = (String) rawMod;
                        }
                    }
                    if (modText == null || modText.isBlank()) {
                        Object selMods = itemMap.get("selectedModifiers");
                        if (selMods instanceof List<?>) {
                            List<String> modNames = new ArrayList<>();
                            for (Object m : (List<?>) selMods) {
                                if (m instanceof Map<?, ?>) {
                                    Object name = ((Map<?, ?>) m).get("name");
                                    Object price = ((Map<?, ?>) m).get("extraPrice") != null
                                            ? ((Map<?, ?>) m).get("extraPrice")
                                            : ((Map<?, ?>) m).get("price");
                                    if (name != null) {
                                        if (price instanceof Number && ((Number) price).intValue() > 0) {
                                            modNames.add(name + " (+" + String.format("%,d", ((Number) price).intValue()) + "₫)");
                                        } else {
                                            modNames.add(name.toString());
                                        }
                                    }
                                }
                            }
                            if (!modNames.isEmpty()) {
                                modText = String.join(", ", modNames);
                            }
                        }
                    }

                    items.add(KdsTicketItemDto.builder()
                            .id((String) itemMap.get("id"))
                            .menuItemId((String) itemMap.get("menuItemId"))
                            .itemName((String) itemMap.get("itemName"))
                            .quantity(itemMap.get("quantity") instanceof Number ? ((Number) itemMap.get("quantity")).intValue() : 1)
                            .note((String) itemMap.get("note"))
                            .status((String) itemMap.get("status"))
                            .modifiersText(modText)
                            .build());
                }
            }
        }

        String orderTime = (String) map.get("orderTime");
        if (orderTime == null || orderTime.isBlank()) {
            orderTime = (String) map.get("timestamp");
        }
        if (orderTime == null || orderTime.isBlank()) {
            orderTime = (String) map.get("createdAt");
        }
        if (orderTime == null || orderTime.isBlank()) {
            orderTime = java.time.LocalDateTime.now().toString();
        }

        return KdsTicketDto.builder()
                .orderId((String) map.get("orderId"))
                .branchId((String) map.get("branchId"))
                .tableId((String) map.get("tableId"))
                .tableName((String) map.get("tableName"))
                .orderTime(orderTime)
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
