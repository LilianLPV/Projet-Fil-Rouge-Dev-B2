package com.ymmo.repository;

import com.ymmo.model.Bien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BienRepository extends JpaRepository<Bien, Integer> {
    // Spring génère automatiquement les requêtes SQL
}