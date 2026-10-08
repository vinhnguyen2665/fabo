package dev.c9tech.fabo.kds.service;

import dev.c9tech.fabo.kds.dto.KdsTicketDto;

import java.util.List;
import java.util.Map;

public interface KdsService {
    List<KdsTicketDto> getTickets(String branchId);
    Map<String, Object> updateTicketStatus(String orderId, String status);
    Map<String, Object> updateTicketStatus(String orderId, String status, String itemId);
    Map<String, Object> updateItemStatus(String itemId, String status);
    Map<String, Object> completeAllItems(String orderId);
    Map<String, Object> callWaiter(String orderId);
    void saveIncomingTicket(Map<String, Object> ticket);
}
