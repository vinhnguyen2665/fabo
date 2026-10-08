package dev.c9tech.fabo.kds.service.impl;

import dev.c9tech.fabo.kds.dao.KdsTicketDAO;
import dev.c9tech.fabo.kds.dto.KdsTicketDto;
import dev.c9tech.fabo.kds.mapper.KdsTicketMapper;
import dev.c9tech.fabo.kds.service.KdsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KdsServiceImpl implements KdsService {

    private final KdsTicketDAO kdsTicketDAO;

    @Override
    public List<KdsTicketDto> getTickets(String branchId) {
        log.info("Lấy danh sách vé bếp chi nhánh: {}", branchId);
        List<Map<String, Object>> tickets = kdsTicketDAO.findTicketsByBranch(branchId);
        return KdsTicketMapper.fromMapList(tickets);
    }

    @Override
    public Map<String, Object> updateTicketStatus(String orderId, String status) {
        String newStatus = status != null ? status : "COMPLETED";
        log.info("Cập nhật trạng thái vé {} thành {}", orderId, newStatus);

        if ("COMPLETED".equals(newStatus)) {
            kdsTicketDAO.remove(orderId);
        } else {
            kdsTicketDAO.findByOrderId(orderId).ifPresent(ticket -> {
                ticket.put("status", newStatus);
                kdsTicketDAO.save(orderId, ticket);
            });
        }

        return Map.of("status", "UPDATED", "orderId", orderId, "ticketStatus", newStatus);
    }

    @Override
    public void saveIncomingTicket(Map<String, Object> ticket) {
        String orderId = (String) ticket.get("orderId");
        if (orderId != null) {
            kdsTicketDAO.save(orderId, ticket);
        }
    }
}
