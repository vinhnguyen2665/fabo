package dev.c9tech.fabo.kds.dao;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface KdsTicketDAO {
    List<Map<String, Object>> findTicketsByBranch(String branchId);
    Optional<Map<String, Object>> findByOrderId(String orderId);
    void save(String orderId, Map<String, Object> ticket);
    void remove(String orderId);
}
