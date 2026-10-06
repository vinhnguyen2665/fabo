package dev.c9tech.fabo.pos.repository;

import dev.c9tech.fabo.pos.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, String> {
    List<DiningTable> findByBranchIdOrderByAreaIdAscIdAsc(String branchId);
    java.util.Optional<DiningTable> findByActiveOrderId(String activeOrderId);
}
