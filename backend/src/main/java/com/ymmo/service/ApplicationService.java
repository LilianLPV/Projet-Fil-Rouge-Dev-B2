package com.ymmo.service;

import com.ymmo.model.Application;
import com.ymmo.model.Listing;
import com.ymmo.model.User;
import com.ymmo.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
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
        return applicationRepository.save(application);
    }

    public void delete(Integer id) {
        applicationRepository.deleteById(id);
    }
}
