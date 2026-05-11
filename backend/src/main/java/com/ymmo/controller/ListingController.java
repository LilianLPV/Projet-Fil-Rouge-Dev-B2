package com.ymmo.controller;

import com.ymmo.model.Listing;
import com.ymmo.service.ListingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
@CrossOrigin(origins = "*")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public List<Listing> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal maxPrice) {
        if (city != null) return listingService.findByCity(city);
        if (maxPrice != null) return listingService.findByMaxPrice(maxPrice);
        return listingService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Listing> getById(@PathVariable Integer id) {
        Listing listing = listingService.findById(id);
        if (listing == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(listing);
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<List<Listing>> getByAgency(@PathVariable Integer agencyId) {
        com.ymmo.model.Agency agency = new com.ymmo.model.Agency();
        agency.setId(agencyId);
        return ResponseEntity.ok(listingService.findByAgency(agency));
    }

    @PostMapping
    public ResponseEntity<Listing> create(@RequestBody Listing listing) {
        return ResponseEntity.status(201).body(listingService.save(listing));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Listing> update(@PathVariable Integer id, @RequestBody Listing listing) {
        if (listingService.findById(id) == null) return ResponseEntity.notFound().build();
        listing.setId(id);
        return ResponseEntity.ok(listingService.save(listing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (listingService.findById(id) == null) return ResponseEntity.notFound().build();
        listingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
