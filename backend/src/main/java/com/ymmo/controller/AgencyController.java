package com.ymmo.controller;

import com.ymmo.model.Agency;
import com.ymmo.service.AgencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/agencies")
@CrossOrigin(origins = "*") // autorise les appels depuis le front-end
public class AgencyController {

    private final AgencyService agencyService;

    public AgencyController(AgencyService agencyService) {
        this.agencyService = agencyService;
    }

    @GetMapping
    public List<Agency> getAll() {
        return agencyService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agency> getById(@PathVariable Integer id) {
        Agency agency = agencyService.findById(id);
        if (agency == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(agency);
    }

    @PostMapping
    public ResponseEntity<Agency> create(@RequestBody Agency agency) {
        return ResponseEntity.status(201).body(agencyService.save(agency));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Agency> update(@PathVariable Integer id, @RequestBody Agency agency) {
        if (agencyService.findById(id) == null) return ResponseEntity.notFound().build();
        agency.setId(id);
        return ResponseEntity.ok(agencyService.save(agency));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (agencyService.findById(id) == null) return ResponseEntity.notFound().build();
        agencyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}