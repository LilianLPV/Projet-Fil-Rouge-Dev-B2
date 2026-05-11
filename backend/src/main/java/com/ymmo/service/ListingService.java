package com.ymmo.service;

import com.ymmo.model.Agency;
import com.ymmo.model.Listing;
import com.ymmo.model.ListingStatus;
import com.ymmo.model.ListingType;
import com.ymmo.repository.ListingRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;

    public ListingService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public List<Listing> findAll() {
        return listingRepository.findAll();
    }

    public Listing findById(Integer id) {
        return listingRepository.findById(id).orElse(null);
    }

    public List<Listing> findByAgency(Agency agency) {
        return listingRepository.findByAgency(agency);
    }

    public List<Listing> findByType(ListingType type) {
        return listingRepository.findByType(type);
    }

    public List<Listing> findByStatus(ListingStatus status) {
        return listingRepository.findByStatus(status);
    }

    public List<Listing> findByCity(String city) {
        return listingRepository.findByAddressCity(city);
    }

    public List<Listing> findByMaxPrice(BigDecimal maxPrice) {
        return listingRepository.findByPriceLessThanEqual(maxPrice);
    }

    public Listing save(Listing listing) {
        return listingRepository.save(listing);
    }

    public void delete(Integer id) {
        listingRepository.deleteById(id);
    }
}
