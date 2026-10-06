package dev.c9tech.fabo.hrm.repository;

import dev.c9tech.fabo.hrm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    List<User> findByBranchIdAndIsActiveTrue(String branchId);
    Optional<User> findByUsername(String username);
}
