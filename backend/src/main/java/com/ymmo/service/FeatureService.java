package com.ymmo.service;

import com.ymmo.model.Feature;
import com.ymmo.repository.FeatureRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FeatureService {

    private final FeatureRepository featureRepository;

    public FeatureService(FeatureRepository featureRepository) {
        this.featureRepository = featureRepository;
    }

    public List<Feature> findAll() {
        return featureRepository.findAll();
    }

    public Feature findById(Integer id) {
        return featureRepository.findById(id).orElse(null);
    }

    public Feature save(Feature feature) {
        return featureRepository.save(feature);
    }

    public void delete(Integer id) {
        featureRepository.deleteById(id);
    }
}
