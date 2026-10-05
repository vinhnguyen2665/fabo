package dev.c9tech.fabo.hrm.repository;

import dev.c9tech.fabo.hrm.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(String userId);
    List<AuditLog> findByEntityNameOrderByCreatedAtDesc(String entityName);
}
