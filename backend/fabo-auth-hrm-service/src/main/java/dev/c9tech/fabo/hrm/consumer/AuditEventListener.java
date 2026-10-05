package dev.c9tech.fabo.hrm.consumer;

import dev.c9tech.fabo.hrm.entity.AuditLog;
import dev.c9tech.fabo.hrm.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;

    @KafkaListener(topics = "audit-events-topic", groupId = "fabo-hrm-audit-group")
    public void handleAuditEvent(Map<String, Object> event) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .id(UUID.randomUUID().toString())
                    .userId((String) event.get("userId"))
                    .userName((String) event.get("userName"))
                    .action((String) event.get("action"))
                    .entityName((String) event.get("entityName"))
                    .entityId((String) event.get("entityId"))
                    .snapshotBefore((String) event.get("snapshotBefore"))
                    .snapshotAfter((String) event.get("snapshotAfter"))
                    .ipAddress((String) event.get("ipAddress"))
                    .createdAt(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Đã ghi nhận audit log: action={}, entity={}", auditLog.getAction(), auditLog.getEntityName());
        } catch (Exception e) {
            log.error("Lỗi khi lưu audit event: {}", e.getMessage(), e);
        }
    }
}
