package com.ymmo.repository;

import com.ymmo.model.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Integer> {

    // Recherche par nom (Spring génère le SQL automatiquement)
    Agency findByNom(String nom);
}