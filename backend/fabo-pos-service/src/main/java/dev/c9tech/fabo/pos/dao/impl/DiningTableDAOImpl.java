package dev.c9tech.fabo.pos.dao.impl;

import dev.c9tech.fabo.pos.dao.DiningTableDAO;
import dev.c9tech.fabo.pos.dto.TableLayoutDto;
import dev.c9tech.fabo.pos.entity.DiningTable;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.List;

@Slf4j
@Repository
public class DiningTableDAOImpl implements DiningTableDAO {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<DiningTable> findTablesByBranch(String branchId) {
        return entityManager.createQuery(
                "SELECT t FROM DiningTable t WHERE t.branchId = :branchId ORDER BY t.areaId ASC, t.id ASC",
                DiningTable.class
        ).setParameter("branchId", branchId).getResultList();
    }

    @Override
    public void updateTableLayoutBatch(List<TableLayoutDto> layouts) {
        for (TableLayoutDto dto : layouts) {
            DiningTable table = entityManager.find(DiningTable.class, dto.getId());
            if (table != null) {
                if (dto.getPosX() != null) table.setPosX(dto.getPosX());
                if (dto.getPosY() != null) table.setPosY(dto.getPosY());
                if (dto.getWidth() != null) table.setWidth(dto.getWidth());
                if (dto.getHeight() != null) table.setHeight(dto.getHeight());
                if (dto.getShape() != null) table.setShape(dto.getShape());
                if (dto.getRotation() != null) table.setRotation(dto.getRotation());
                entityManager.merge(table);
            }
        }
    }
}
