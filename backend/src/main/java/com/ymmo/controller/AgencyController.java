package com.ymmo.controller;

import com.ymmo.model.Agency;
import com.ymmo.service.AgencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/agencies")
@CrossOrigin(origins = "*") // autorise les appels depuis le front-end
public class AgencyController {

    private final AgencyService agencyService;

    public AgencyController(AgencyService agencyService) {
        this.agencyService = agencyService;
    }

    // GET /agencies → liste toutes les agences
    @GetMapping
    public List<Agency> getAll() {
        return agencyService.findAll();
    }

    // GET /agencies/1 → détail d'une agence
    @GetMapping("/{id}")
    public ResponseEntity<Agency> getById(@PathVariable Integer id) {
        Agency agency = agencyService.findById(id);
        if (agency == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(agency);
    }

    // POST /agencies → créer une agence
    @PostMapping
    public Agency create(@RequestBody Agency agency) {
        return agencyService.save(agency);
    }

    // PUT /agencies/1 → modifier une agence
    @PutMapping("/{id}")
    public ResponseEntity<Agency> update(@PathVariable Integer id, @RequestBody Agency agency) {
        if (agencyService.findById(id) == null) return ResponseEntity.notFound().build();
        agency.setId(id);
        return ResponseEntity.ok(agencyService.save(agency));
    }

    // DELETE /agencies/1 → supprimer une agence
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (agencyService.findById(id) == null) return ResponseEntity.notFound().build();
        agencyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}