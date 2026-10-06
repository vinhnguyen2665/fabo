package dev.c9tech.fabo.kds.service;

import java.util.List;
import java.util.Map;

public interface KdsService {
    List<Map<String, Object>> getTickets(String branchId);
    Map<String, Object> updateTicketStatus(String orderId, String status);
    void saveIncomingTicket(Map<String, Object> ticket);
}
