package dev.c9tech.fabo.pos.service;

import dev.c9tech.fabo.pos.dto.*;
import dev.c9tech.fabo.pos.entity.DiningTable;

import java.util.List;
import java.util.Map;

public interface DiningTableService {
    List<DiningTable> getTables(String branchId);
    DiningTable createTable(CreateTableDto dto);
    void deleteTable(String tableId);
    void updateTableLayout(List<TableLayoutDto> layouts);
    Map<String, Object> transferTable(TransferTableDto dto);
    Map<String, Object> mergeTable(MergeTableDto dto);
}
