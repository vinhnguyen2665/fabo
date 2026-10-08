package dev.c9tech.fabo.kds.service;

import dev.c9tech.fabo.kds.dto.KdsTicketDto;

import java.util.List;
import java.util.Map;

public interface KdsService {
    List<KdsTicketDto> getTickets(String branchId);
    Map<String, Object> updateTicketStatus(String orderId, String status);
    void saveIncomingTicket(Map<String, Object> ticket);
}
