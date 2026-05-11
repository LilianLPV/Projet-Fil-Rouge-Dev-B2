package com.ymmo.controller;

import com.ymmo.model.Application;
import com.ymmo.model.Listing;
import com.ymmo.model.User;
import com.ymmo.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<Application> getAll() {
        return applicationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getById(@PathVariable Integer id) {
        Application application = applicationService.findById(id);
        if (application == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(application);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>> getByUser(@PathVariable Integer userId) {
        User user = new User();
        user.setId(userId);
        return ResponseEntity.ok(applicationService.findByUser(user));
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<Application>> getByListing(@PathVariable Integer listingId) {
        Listing listing = new Listing();
        listing.setId(listingId);
        return ResponseEntity.ok(applicationService.findByListing(listing));
    }

    @PostMapping
    public ResponseEntity<Application> create(@RequestBody Application application) {
        return ResponseEntity.status(201).body(applicationService.save(application));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> update(@PathVariable Integer id, @RequestBody Application application) {
        if (applicationService.findById(id) == null) return ResponseEntity.notFound().build();
        application.setId(id);
        return ResponseEntity.ok(applicationService.save(application));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (applicationService.findById(id) == null) return ResponseEntity.notFound().build();
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
