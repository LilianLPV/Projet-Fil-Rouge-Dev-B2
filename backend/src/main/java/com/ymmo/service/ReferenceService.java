package com.ymmo.service;

import com.ymmo.model.*;
import com.ymmo.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReferenceService {

    private final ListingTypeRepository listingTypeRepository;
    private final ListingStatusRepository listingStatusRepository;
    private final ApplicationStatusRepository applicationStatusRepository;
    private final FeatureTypeRepository featureTypeRepository;
    private final RoleRepository roleRepository;

    public ReferenceService(
            ListingTypeRepository listingTypeRepository,
            ListingStatusRepository listingStatusRepository,
            ApplicationStatusRepository applicationStatusRepository,
            FeatureTypeRepository featureTypeRepository,
            RoleRepository roleRepository) {
        this.listingTypeRepository = listingTypeRepository;
        this.listingStatusRepository = listingStatusRepository;
        this.applicationStatusRepository = applicationStatusRepository;
        this.featureTypeRepository = featureTypeRepository;
        this.roleRepository = roleRepository;
    }

    public List<ListingType> findAllListingTypes() {
        return listingTypeRepository.findAll();
    }

    public List<ListingStatus> findAllListingStatuses() {
        return listingStatusRepository.findAll();
    }

    public List<ApplicationStatus> findAllApplicationStatuses() {
        return applicationStatusRepository.findAll();
    }

    public List<FeatureType> findAllFeatureTypes() {
        return featureTypeRepository.findAll();
    }

    public List<Role> findAllRoles() {
        return roleRepository.findAll();
    }
}
