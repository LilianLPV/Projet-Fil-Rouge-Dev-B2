package com.ymmo.controller;

import com.ymmo.model.Feature;
import com.ymmo.service.FeatureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/features")
@CrossOrigin(origins = "*")
public class FeatureController {

    private final FeatureService featureService;

    public FeatureController(FeatureService featureService) {
        this.featureService = featureService;
    }

    @GetMapping
    public List<Feature> getAll() {
        return featureService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feature> getById(@PathVariable Integer id) {
        Feature feature = featureService.findById(id);
        if (feature == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(feature);
    }

    @PostMapping
    public ResponseEntity<Feature> create(@RequestBody Feature feature) {
        return ResponseEntity.status(201).body(featureService.save(feature));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (featureService.findById(id) == null) return ResponseEntity.notFound().build();
        featureService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
