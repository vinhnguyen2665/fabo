package dev.c9tech.fabo.hrm.dao.impl;

import dev.c9tech.fabo.hrm.dao.UserDAO;
import dev.c9tech.fabo.hrm.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserDAOImpl implements UserDAO {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<User> findActiveUsersByBranch(String branchId) {
        return entityManager.createQuery(
                "SELECT u FROM User u WHERE u.branchId = :branchId AND u.isActive = true",
                User.class)
                .setParameter("branchId", branchId)
                .getResultList();
    }

    @Override
    public Optional<User> findById(String id) {
        User user = entityManager.find(User.class, id);
        return Optional.ofNullable(user);
    }
}
