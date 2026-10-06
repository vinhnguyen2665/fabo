package dev.c9tech.fabo.pos.repository;

import dev.c9tech.fabo.pos.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByOrderId(String orderId);
}
