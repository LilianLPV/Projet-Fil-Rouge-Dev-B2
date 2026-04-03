package com.ymmo.service;

import com.ymmo.model.Bien;
import com.ymmo.repository.BienRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BienService {

    private final BienRepository bienRepository;

    public BienService(BienRepository bienRepository) {
        this.bienRepository = bienRepository;
    }

    public List<Bien> findAll() {
        return bienRepository.findAll();
    }

    public Bien findById(Integer id) {
        return bienRepository.findById(id).orElse(null);
    }

    public Bien save(Bien bien) {
        return bienRepository.save(bien);
    }

    public void delete(Integer id) {
        bienRepository.deleteById(id);
    }
}