package dev.c9tech.fabo.pos.repository;

import dev.c9tech.fabo.pos.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    List<MenuItem> findByBranchIdAndIsAvailableTrue(String branchId);
}
