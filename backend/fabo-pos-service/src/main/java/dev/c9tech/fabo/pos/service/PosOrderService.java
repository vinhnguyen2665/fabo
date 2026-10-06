package dev.c9tech.fabo.pos.service;

import dev.c9tech.fabo.pos.dto.CreateOrderDto;
import dev.c9tech.fabo.pos.dto.PayInvoiceDto;

import java.util.Map;

public interface PosOrderService {
    Map<String, Object> getTableActiveOrder(String tableId);
    Map<String, Object> createOrder(CreateOrderDto dto);
    Map<String, Object> payInvoice(String orderId, PayInvoiceDto dto);
}
