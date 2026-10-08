package dev.c9tech.fabo.pos.service.impl;

import dev.c9tech.fabo.pos.dao.DiningTableDAO;
import dev.c9tech.fabo.pos.dto.*;
import dev.c9tech.fabo.pos.entity.DiningTable;
import dev.c9tech.fabo.pos.entity.OrderItem;
import dev.c9tech.fabo.pos.enums.TableStatus;
import dev.c9tech.fabo.pos.mapper.DiningTableMapper;
import dev.c9tech.fabo.pos.repository.DiningTableRepository;
import dev.c9tech.fabo.pos.repository.OrderItemRepository;
import dev.c9tech.fabo.pos.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiningTableServiceImpl implements DiningTableService {

    private final DiningTableRepository tableRepository;
    private final DiningTableDAO diningTableDAO;
    private final OrderItemRepository orderItemRepository;

    @Override
    public List<DiningTableDto> getTables(String branchId) {
        List<DiningTable> entities = diningTableDAO.findTablesByBranch(branchId);
        return DiningTableMapper.toDtoList(entities);
    }

    @Override
    @Transactional
    public DiningTableDto createTable(CreateTableDto dto) {
        log.info("Thêm bàn mới: {}", dto.getTableName());
        if (dto.getTableName() == null || dto.getTableName().isBlank()) {
            throw new IllegalArgumentException("Tên bàn không được để trống");
        }

        String tableId = dto.getId();
        if (tableId == null || tableId.isBlank()) {
            tableId = "T-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        DiningTable table = DiningTable.builder()
                .id(tableId)
                .tableName(dto.getTableName().trim())
                .areaId(dto.getAreaId() != null && !dto.getAreaId().isBlank() ? dto.getAreaId() : "A1")
                .areaName(dto.getAreaName() != null && !dto.getAreaName().isBlank() ? dto.getAreaName() : "Tầng 1 (Máy Lạnh)")
                .branchId(dto.getBranchId() != null && !dto.getBranchId().isBlank() ? dto.getBranchId() : "B01")
                .status(TableStatus.EMPTY)
                .capacity(dto.getCapacity() != null && dto.getCapacity() > 0 ? dto.getCapacity() : 4)
                .posX(dto.getPosX() != null ? dto.getPosX() : 80)
                .posY(dto.getPosY() != null ? dto.getPosY() : 80)
                .width(dto.getWidth() != null ? dto.getWidth() : 130)
                .height(dto.getHeight() != null ? dto.getHeight() : 110)
                .shape(dto.getShape() != null ? dto.getShape() : "RECTANGLE")
                .rotation(0)
                .lastStatusChange(LocalDateTime.now())
                .build();

        DiningTable saved = tableRepository.save(table);
        return DiningTableMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteTable(String tableId) {
        log.info("Xóa bàn: {}", tableId);
        DiningTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn"));

        if (table.getStatus() == TableStatus.OCCUPIED || table.getActiveOrderId() != null) {
            throw new IllegalStateException("Không thể xóa bàn đang có khách hoặc đang có đơn phục vụ!");
        }

        tableRepository.delete(table);
    }

    @Override
    @Transactional
    public void updateTableLayout(List<TableLayoutDto> layouts) {
        log.info("Cập nhật bố cục 2D cho {} bàn", layouts.size());
        diningTableDAO.updateTableLayoutBatch(layouts);
    }

    @Override
    @Transactional
    public Map<String, Object> transferTable(TransferTableDto dto) {
        log.info("Chuyển bàn từ {} sang {}", dto.getSourceTableId(), dto.getTargetTableId());
        DiningTable source = tableRepository.findById(dto.getSourceTableId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn nguồn"));
        DiningTable target = tableRepository.findById(dto.getTargetTableId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn đích"));

        if (target.getStatus() == TableStatus.OCCUPIED) {
            throw new IllegalStateException("Bàn đích đang có khách, vui lòng dùng chức năng Gộp bàn");
        }

        String orderId = source.getActiveOrderId();
        target.setActiveOrderId(orderId);
        target.setStatus(TableStatus.OCCUPIED);
        target.setLastStatusChange(LocalDateTime.now());

        source.setActiveOrderId(null);
        source.setStatus(TableStatus.EMPTY);
        source.setLastStatusChange(LocalDateTime.now());

        tableRepository.save(target);
        tableRepository.save(source);

        return Map.of(
                "status", "TRANSFERRED",
                "orderId", orderId != null ? orderId : "",
                "sourceTable", DiningTableMapper.toDto(source),
                "targetTable", DiningTableMapper.toDto(target)
        );
    }

    @Override
    @Transactional
    public Map<String, Object> mergeTable(MergeTableDto dto) {
        log.info("Gộp bàn từ {} vào {}", dto.getSourceTableId(), dto.getTargetTableId());
        DiningTable source = tableRepository.findById(dto.getSourceTableId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn nguồn"));
        DiningTable target = tableRepository.findById(dto.getTargetTableId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn đích"));

        String sourceOrderId = source.getActiveOrderId();
        String targetOrderId = target.getActiveOrderId();

        if (sourceOrderId != null && targetOrderId != null) {
            List<OrderItem> sourceItems = orderItemRepository.findByOrderId(sourceOrderId);
            for (OrderItem it : sourceItems) {
                it.setOrderId(targetOrderId);
                orderItemRepository.save(it);
            }
        }

        source.setActiveOrderId(null);
        source.setStatus(TableStatus.EMPTY);
        source.setLastStatusChange(LocalDateTime.now());

        tableRepository.save(source);

        return Map.of(
                "status", "MERGED",
                "mergedOrderId", targetOrderId != null ? targetOrderId : "",
                "sourceTable", DiningTableMapper.toDto(source),
                "targetTable", DiningTableMapper.toDto(target)
        );
    }
}
