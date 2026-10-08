package dev.c9tech.fabo.kds.service;

import dev.c9tech.fabo.kds.dao.impl.KdsTicketDAOImpl;
import dev.c9tech.fabo.kds.service.impl.KdsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class KdsServiceTest {

    private KdsService kdsService;

    @BeforeEach
    void setUp() {
        kdsService = new KdsServiceImpl(new KdsTicketDAOImpl(), null);
    }

    @Test
    void testUpdateTicketStatusSuccess() {
        Map<String, Object> result = kdsService.updateTicketStatus("ORD-1024", "COOKING");
        assertEquals("UPDATED", result.get("status"));
        assertEquals("COOKING", result.get("ticketStatus"));
    }

    @Test
    void testUpdateTicketStatusInvalidValueThrowsException() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> kdsService.updateTicketStatus("ORD-1024", "INVALID_STATUS")
        );
        assertTrue(ex.getMessage().contains("không hợp lệ"));
    }

    @Test
    void testUpdateTicketStatusNullOrBlankThrowsException() {
        assertThrows(
                IllegalArgumentException.class,
                () -> kdsService.updateTicketStatus("ORD-1024", null)
        );
        assertThrows(
                IllegalArgumentException.class,
                () -> kdsService.updateTicketStatus("ORD-1024", "   ")
        );
    }

    @Test
    void testUpdateTicketStatusNotFoundThrowsException() {
        assertThrows(
                IllegalArgumentException.class,
                () -> kdsService.updateTicketStatus("NON_EXISTING_ORDER", "COOKING")
        );
    }

    @Test
    void testUpdateSingleItemStatusInTicket() {
        Map<String, Object> result = kdsService.updateTicketStatus("ORD-1024", "COOKING", "it-2");
        assertEquals("UPDATED", result.get("status"));

        var tickets = kdsService.getTickets("B01");
        var ticket = tickets.stream().filter(t -> "ORD-1024".equals(t.getOrderId())).findFirst().orElseThrow();
        var item2 = ticket.getItems().stream().filter(it -> "it-2".equals(it.getId())).findFirst().orElseThrow();
        assertEquals("COOKING", item2.getStatus());
    }

    @Test
    void testUpdateItemStatusSuccess() {
        Map<String, Object> result = kdsService.updateItemStatus("it-2", "COOKING");
        assertEquals("UPDATED", result.get("status"));

        var tickets = kdsService.getTickets("B01");
        var ticket = tickets.stream().filter(t -> "ORD-1024".equals(t.getOrderId())).findFirst().orElseThrow();
        var item2 = ticket.getItems().stream().filter(it -> "it-2".equals(it.getId())).findFirst().orElseThrow();
        assertEquals("COOKING", item2.getStatus());
    }

    @Test
    void testCompleteAllItemsSuccess() {
        Map<String, Object> result = kdsService.completeAllItems("ORD-1024");
        assertEquals("ITEMS_COMPLETED", result.get("status"));

        var tickets = kdsService.getTickets("B01");
        var ticket = tickets.stream().filter(t -> "ORD-1024".equals(t.getOrderId())).findFirst().orElseThrow();
        assertTrue(ticket.getItems().stream().allMatch(it -> "COMPLETED".equals(it.getStatus())));
    }

    @Test
    void testCallWaiterRemovesTicket() {
        Map<String, Object> result = kdsService.callWaiter("ORD-1024");
        assertEquals("WAITER_CALLED", result.get("status"));

        var tickets = kdsService.getTickets("B01");
        assertTrue(tickets.stream().noneMatch(t -> "ORD-1024".equals(t.getOrderId())));
    }
}
