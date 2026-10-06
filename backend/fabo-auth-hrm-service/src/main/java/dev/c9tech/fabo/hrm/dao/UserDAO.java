package dev.c9tech.fabo.hrm.dao;

import dev.c9tech.fabo.hrm.entity.User;
import java.util.List;
import java.util.Optional;

public interface UserDAO {
    List<User> findActiveUsersByBranch(String branchId);
    Optional<User> findById(String id);
}
