package com.ymmo.controller;

import com.ymmo.model.Bien;
import com.ymmo.service.BienService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/biens")
@CrossOrigin(origins = "*")
public class BienController {

    private final BienService bienService;

    public BienController(BienService bienService) {
        this.bienService = bienService;
    }

    @GetMapping
    public List<Bien> getAll() {
        return bienService.findAll();
    }

    @GetMapping("/{id}")
    public Bien getById(@PathVariable Long id) {
        return bienService.findById(id);
    }

    @PostMapping
    public Bien create(@RequestBody Bien bien) {
        return bienService.save(bien);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bienService.delete(id);
    }
}