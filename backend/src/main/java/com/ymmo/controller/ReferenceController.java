package com.ymmo.controller;

import com.ymmo.model.*;
import com.ymmo.service.ReferenceService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReferenceController {

    private final ReferenceService referenceService;

    public ReferenceController(ReferenceService referenceService) {
        this.referenceService = referenceService;
    }

    @GetMapping("/listing-types")
    public List<ListingType> getListingTypes() {
        return referenceService.findAllListingTypes();
    }

    @GetMapping("/listing-statuses")
    public List<ListingStatus> getListingStatuses() {
        return referenceService.findAllListingStatuses();
    }

    @GetMapping("/application-statuses")
    public List<ApplicationStatus> getApplicationStatuses() {
        return referenceService.findAllApplicationStatuses();
    }

    @GetMapping("/feature-types")
    public List<FeatureType> getFeatureTypes() {
        return referenceService.findAllFeatureTypes();
    }

    @GetMapping("/roles")
    public List<Role> getRoles() {
        return referenceService.findAllRoles();
    }
}
