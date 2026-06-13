package com.ymmo.service;

import com.ymmo.model.Application;
import com.ymmo.model.ApplicationStatus;
import com.ymmo.model.Listing;
import com.ymmo.model.User;
import com.ymmo.repository.ApplicationRepository;
import com.ymmo.repository.ApplicationStatusRepository;
import com.ymmo.repository.ListingRepository;
import com.ymmo.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDate;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ApplicationStatusRepository statusRepository;

    public ApplicationService(ApplicationRepository applicationRepository, ListingRepository listingRepository, UserRepository userRepository, ApplicationStatusRepository statusRepository) {
        this.applicationRepository = applicationRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.statusRepository = statusRepository;
    }

    public List<Application> findAll() {
        return applicationRepository.findAll();
    }

    public Application findById(Integer id) {
        return applicationRepository.findById(id).orElse(null);
    }

    public List<Application> findByUser(User user) {
        return applicationRepository.findByUser(user);
    }

    public List<Application> findByListing(Listing listing) {
        return applicationRepository.findByListing(listing);
    }

    public Application save(Application application) {
        if (application.getListing() != null && application.getListing().getId() != null) {
            Listing listing = listingRepository.findById(application.getListing().getId()).orElse(null);
            if (listing != null) {
                application.setListing(listing);
            }
        }
        if (application.getUser() != null && application.getUser().getId() != null) {
            User user = userRepository.findById(application.getUser().getId()).orElse(null);
            if (user != null) {
                application.setUser(user);
            }
        }
        if (application.getStatus() == null) {
            ApplicationStatus defaultStatus = statusRepository.findById(1).orElse(null);
            if (defaultStatus != null) {
                application.setStatus(defaultStatus);
            }
        } else if (application.getStatus().getId() != null) {
            ApplicationStatus status = statusRepository.findById(application.getStatus().getId()).orElse(null);
            if (status != null) {
                application.setStatus(status);
            }
        }
        return applicationRepository.save(application);
    }

    public void delete(Integer id) {
        applicationRepository.deleteById(id);
    }
}
