package com.ymmo.repository;

import com.ymmo.model.Agency;
import com.ymmo.model.Role;
import com.ymmo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByAgency(Agency agency);
    List<User> findByRole(Role role);
}
