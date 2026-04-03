package com.ymmo.service;

import com.ymmo.model.Agency;
import com.ymmo.repository.AgencyRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AgencyService {

    private final AgencyRepository agencyRepository;

    public AgencyService(AgencyRepository agencyRepository) {
        this.agencyRepository = agencyRepository;
    }

    // Récupérer toutes les agences
    public List<Agency> findAll() {
        return agencyRepository.findAll();
    }

    // Récupérer une agence par son id
    public Agency findById(Integer id) {
        return agencyRepository.findById(id).orElse(null);
    }

    // Créer ou modifier une agence
    public Agency save(Agency agency) {
        return agencyRepository.save(agency);
    }

    // Supprimer une agence
    public void delete(Integer id) {
        agencyRepository.deleteById(id);
    }
}