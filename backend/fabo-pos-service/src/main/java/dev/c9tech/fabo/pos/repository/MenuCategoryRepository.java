package dev.c9tech.fabo.pos.repository;

import dev.c9tech.fabo.pos.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, String> {
    List<MenuCategory> findByBranchIdAndIsActiveTrueOrderByDisplayOrderAsc(String branchId);
}
