package dev.c9tech.fabo.kds.dao.impl;

import dev.c9tech.fabo.kds.dao.KdsTicketDAO;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class KdsTicketDAOImpl implements KdsTicketDAO {

    private final Map<String, Map<String, Object>> tickets = new ConcurrentHashMap<>();

    public KdsTicketDAOImpl() {
        // Sample seed ticket
        Map<String, Object> tck1 = new HashMap<>();
        tck1.put("orderId", "ORD-1024");
        tck1.put("branchId", "B01");
        tck1.put("tableId", "T02");
        tck1.put("tableName", "Bàn 02");
        tck1.put("orderTime", LocalDateTime.now().minusMinutes(5).toString());
        tck1.put("items", List.of(
                Map.of("id", "it-1", "menuItemId", "M01", "itemName", "Phở Bò Tái Nạm Đặc Biệt", "quantity", 2, "note", "Ít bánh phở, nước trong", "status", "COOKING", "modifiersText", "1 Quả Trứng Chần (+10.000₫)"),
                Map.of("id", "it-2", "menuItemId", "M04", "itemName", "Cà Phê Muối Xứ Huế", "quantity", 2, "status", "PENDING", "modifiersText", "70% Đường, Bình thường đá")
        ));
        tickets.put("ORD-1024", tck1);
    }

    @Override
    public List<Map<String, Object>> findTicketsByBranch(String branchId) {
        return tickets.values().stream()
                .filter(t -> branchId == null || branchId.equals(t.get("branchId")))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Map<String, Object>> findByOrderId(String orderId) {
        return Optional.ofNullable(tickets.get(orderId));
    }

    @Override
    public void save(String orderId, Map<String, Object> ticket) {
        tickets.put(orderId, ticket);
    }

    @Override
    public void remove(String orderId) {
        tickets.remove(orderId);
    }
}
