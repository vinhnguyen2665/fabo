package dev.c9tech.fabo.pos.dao;

import dev.c9tech.fabo.pos.dto.TableLayoutDto;
import dev.c9tech.fabo.pos.entity.DiningTable;

import java.util.List;

public interface DiningTableDAO {
    List<DiningTable> findTablesByBranch(String branchId);
    void updateTableLayoutBatch(List<TableLayoutDto> layouts);
}
