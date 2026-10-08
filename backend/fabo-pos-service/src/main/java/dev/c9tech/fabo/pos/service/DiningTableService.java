package dev.c9tech.fabo.pos.service;

import dev.c9tech.fabo.pos.dto.*;

import java.util.List;
import java.util.Map;

public interface DiningTableService {
    List<DiningTableDto> getTables(String branchId);
    DiningTableDto createTable(CreateTableDto dto);
    void deleteTable(String tableId);
    void updateTableLayout(List<TableLayoutDto> layouts);
    Map<String, Object> transferTable(TransferTableDto dto);
    Map<String, Object> mergeTable(MergeTableDto dto);
}
