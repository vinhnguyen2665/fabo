package dev.c9tech.fabo.kds.service.impl;

import dev.c9tech.fabo.kds.dao.KdsTicketDAO;
import dev.c9tech.fabo.kds.dto.KdsTicketDto;
import dev.c9tech.fabo.kds.dto.KitchenStatus;
import dev.c9tech.fabo.kds.mapper.KdsTicketMapper;
import dev.c9tech.fabo.kds.service.KdsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class KdsServiceImpl implements KdsService {

    private final KdsTicketDAO kdsTicketDAO;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<KdsTicketDto> getTickets(String branchId) {
        log.info("Lấy danh sách vé bếp chi nhánh: {}", branchId);
        List<Map<String, Object>> tickets = kdsTicketDAO.findTicketsByBranch(branchId);
        return KdsTicketMapper.fromMapList(tickets);
    }

    @Override
    public Map<String, Object> updateTicketStatus(String orderId, String status) {
        return updateTicketStatus(orderId, status, null);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> updateTicketStatus(String orderId, String status, String itemId) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("Mã đơn hàng (orderId) không được để trống");
        }
        KitchenStatus kitchenStatus = KitchenStatus.fromString(status);
        String newStatus = kitchenStatus.name();
        log.info("Cập nhật trạng thái vé {} (itemId: {}) thành {}", orderId, itemId, newStatus);

        Map<String, Object> ticket = kdsTicketDAO.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vé bếp với mã đơn hàng: " + orderId));

        if (itemId != null && !itemId.isBlank()) {
            // Update individual item in ticket
            Object rawItems = ticket.get("items");
            if (rawItems instanceof List<?>) {
                List<Map<String, Object>> itemsList = new ArrayList<>();
                for (Object obj : (List<?>) rawItems) {
                    if (obj instanceof Map<?, ?>) {
                        Map<String, Object> itemMap = new HashMap<>((Map<String, Object>) obj);
                        if (itemId.equals(itemMap.get("id")) || itemId.equals(itemMap.get("menuItemId"))) {
                            itemMap.put("status", newStatus);
                        }
                        itemsList.add(itemMap);
                    }
                }
                ticket.put("items", itemsList);

                // Update overall ticket status
                boolean allCompleted = itemsList.stream().allMatch(it -> "COMPLETED".equals(it.get("status")));
                if (allCompleted) {
                    ticket.put("status", "COMPLETED");
                } else {
                    boolean anyCooking = itemsList.stream().anyMatch(it -> "COOKING".equals(it.get("status")));
                    ticket.put("status", anyCooking ? "COOKING" : "PENDING");
                }
            }
            kdsTicketDAO.save(orderId, ticket);
        } else {
            // Whole ticket update
            if (kitchenStatus == KitchenStatus.COMPLETED) {
                kdsTicketDAO.remove(orderId);
            } else {
                ticket.put("status", newStatus);
                Object rawItems = ticket.get("items");
                if (rawItems instanceof List<?>) {
                    List<Map<String, Object>> itemsList = new ArrayList<>();
                    for (Object obj : (List<?>) rawItems) {
                        if (obj instanceof Map<?, ?>) {
                            Map<String, Object> itemMap = new HashMap<>((Map<String, Object>) obj);
                            itemMap.put("status", newStatus);
                            itemsList.add(itemMap);
                        }
                    }
                    ticket.put("items", itemsList);
                }
                kdsTicketDAO.save(orderId, ticket);
            }
        }

        return Map.of("status", "UPDATED", "orderId", orderId, "ticketStatus", newStatus);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> updateItemStatus(String itemId, String status) {
        if (itemId == null || itemId.isBlank()) {
            throw new IllegalArgumentException("Mã món (itemId) không được để trống");
        }
        KitchenStatus kitchenStatus = KitchenStatus.fromString(status);
        String newStatus = kitchenStatus.name();

        List<Map<String, Object>> allTickets = kdsTicketDAO.findTicketsByBranch(null);
        for (Map<String, Object> ticket : allTickets) {
            String orderId = (String) ticket.get("orderId");
            Object rawItems = ticket.get("items");
            if (rawItems instanceof List<?>) {
                boolean contains = ((List<?>) rawItems).stream()
                        .filter(o -> o instanceof Map<?, ?>)
                        .map(o -> (Map<?, ?>) o)
                        .anyMatch(m -> itemId.equals(m.get("id")) || itemId.equals(m.get("menuItemId")));
                if (contains) {
                    return updateTicketStatus(orderId, newStatus, itemId);
                }
            }
        }
        throw new IllegalArgumentException("Không tìm thấy món với mã: " + itemId);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> completeAllItems(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("Mã đơn hàng (orderId) không được để trống");
        }
        Map<String, Object> ticket = kdsTicketDAO.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vé bếp với mã đơn hàng: " + orderId));

        Object rawItems = ticket.get("items");
        if (rawItems instanceof List<?>) {
            List<Map<String, Object>> itemsList = new ArrayList<>();
            for (Object obj : (List<?>) rawItems) {
                if (obj instanceof Map<?, ?>) {
                    Map<String, Object> itemMap = new HashMap<>((Map<String, Object>) obj);
                    itemMap.put("status", "COMPLETED");
                    itemsList.add(itemMap);
                }
            }
            ticket.put("items", itemsList);
        }
        ticket.put("status", "COOKING");
        kdsTicketDAO.save(orderId, ticket);
        log.info("Đã đánh dấu xong tất cả món cho vé {} (chờ bấm gọi bưng)", orderId);
        return Map.of("status", "ITEMS_COMPLETED", "orderId", orderId);
    }

    @Override
    public Map<String, Object> callWaiter(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("Mã đơn hàng (orderId) không được để trống");
        }
        Map<String, Object> ticket = kdsTicketDAO.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vé bếp với mã đơn hàng: " + orderId));

        String branchId = (String) ticket.getOrDefault("branchId", "B01");
        String tableName = (String) ticket.getOrDefault("tableName", "Bàn");

        Map<String, Object> notification = Map.of(
                "type", "CALL_WAITER",
                "event", "ORDER_READY_FOR_PICKUP",
                "orderId", orderId,
                "tableName", tableName,
                "branchId", branchId,
                "items", ticket.get("items") != null ? ticket.get("items") : List.of(),
                "message", "Món ăn cho " + tableName + " (Đơn #" + orderId + ") đã sẵn sàng! Mời phục vụ bưng món.",
                "timestamp", java.time.LocalDateTime.now().toString()
        );

        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/waiter", notification);
                messagingTemplate.convertAndSend("/topic/branch/" + branchId + "/kitchen", notification);
                log.info("Đã phát thông báo GỌI BƯNG cho vé {} tới chi nhánh {}", orderId, branchId);
            } catch (Exception e) {
                log.warn("Không thể gửi STOMP thông báo gọi bưng: {}", e.getMessage());
            }
        }

        // Remove ticket from active kitchen display
        kdsTicketDAO.remove(orderId);

        return Map.of("status", "WAITER_CALLED", "orderId", orderId, "tableName", tableName);
    }

    @Override
    @SuppressWarnings("unchecked")
    public void saveIncomingTicket(Map<String, Object> ticket) {
        String orderId = (String) ticket.get("orderId");
        String tableId = (String) ticket.get("tableId");
        String branchId = (String) ticket.get("branchId");
        if (orderId == null) return;

        // Check if an active ticket already exists for this orderId OR for this tableId
        Optional<Map<String, Object>> existingOpt = kdsTicketDAO.findByOrderId(orderId);
        if (existingOpt.isEmpty() && tableId != null) {
            existingOpt = kdsTicketDAO.findTicketsByBranch(branchId).stream()
                    .filter(t -> tableId.equals(t.get("tableId")))
                    .findFirst();
        }

        if (existingOpt.isPresent()) {
            Map<String, Object> existing = existingOpt.get();
            String targetOrderId = (String) existing.getOrDefault("orderId", orderId);

            ticket.put("orderId", targetOrderId);
            ticket.put("orderTime", existing.getOrDefault("orderTime", ticket.getOrDefault("timestamp", java.time.LocalDateTime.now().toString())));

            // Merge items: preserve existing cooking/completed status
            Object incomingRawItems = ticket.get("items");
            Object existingRawItems = existing.get("items");
            if (incomingRawItems instanceof List<?> && existingRawItems instanceof List<?>) {
                Map<String, String> existingStatuses = new HashMap<>();
                for (Object o : (List<?>) existingRawItems) {
                    if (o instanceof Map<?, ?> m) {
                        String id = (String) m.get("id");
                        String status = (String) m.get("status");
                        if (id != null && status != null) {
                            existingStatuses.put(id, status);
                        }
                    }
                }

                List<Map<String, Object>> mergedItems = new ArrayList<>();
                for (Object o : (List<?>) incomingRawItems) {
                    if (o instanceof Map<?, ?> m) {
                        Map<String, Object> itemMap = new HashMap<>((Map<String, Object>) m);
                        String id = (String) itemMap.get("id");
                        if (id != null && existingStatuses.containsKey(id)) {
                            itemMap.put("status", existingStatuses.get(id));
                        }
                        mergedItems.add(itemMap);
                    }
                }
                ticket.put("items", mergedItems);

                // Compute overall ticket status
                boolean allCompleted = mergedItems.stream().allMatch(it -> "COMPLETED".equals(it.get("status")));
                if (allCompleted) {
                    ticket.put("status", "COMPLETED");
                } else {
                    boolean anyCooking = mergedItems.stream().anyMatch(it -> "COOKING".equals(it.get("status")));
                    ticket.put("status", anyCooking ? "COOKING" : "PENDING");
                }
            }
            kdsTicketDAO.save(targetOrderId, ticket);
            log.info("Cập nhật/gộp món vào vé bếp hiện có cho bàn {} (order: {})", tableId, targetOrderId);
        } else {
            if (ticket.get("orderTime") == null) {
                ticket.put("orderTime", ticket.getOrDefault("timestamp", java.time.LocalDateTime.now().toString()));
            }
            kdsTicketDAO.save(orderId, ticket);
            log.info("Tạo mới vé bếp cho đơn: {}", orderId);
        }
    }
}
