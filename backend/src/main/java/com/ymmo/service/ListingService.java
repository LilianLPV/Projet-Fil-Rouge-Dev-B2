package com.ymmo.service;

import com.ymmo.model.Agency;
import com.ymmo.model.Listing;
import com.ymmo.model.ListingStatus;
import com.ymmo.model.ListingType;
import com.ymmo.repository.AgencyRepository;
import com.ymmo.repository.ListingAddressRepository;
import com.ymmo.repository.ListingRepository;
import com.ymmo.repository.ListingStatusRepository;
import com.ymmo.repository.ListingTypeRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingTypeRepository typeRepository;
    private final ListingStatusRepository statusRepository;
    private final AgencyRepository agencyRepository;
    private final ListingAddressRepository addressRepository;

    public ListingService(ListingRepository listingRepository,
                          ListingTypeRepository typeRepository,
                          ListingStatusRepository statusRepository,
                          AgencyRepository agencyRepository,
                          ListingAddressRepository addressRepository) {
        this.listingRepository = listingRepository;
        this.typeRepository = typeRepository;
        this.statusRepository = statusRepository;
        this.agencyRepository = agencyRepository;
        this.addressRepository = addressRepository;
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
        // Références existantes : on les recharge depuis la BDD pour avoir des entités gérées
        if (listing.getType() != null && listing.getType().getId() != null) {
            typeRepository.findById(listing.getType().getId()).ifPresent(listing::setType);
        }
        if (listing.getStatus() != null && listing.getStatus().getId() != null) {
            statusRepository.findById(listing.getStatus().getId()).ifPresent(listing::setStatus);
        }
        if (listing.getAgency() != null && listing.getAgency().getId() != null) {
            agencyRepository.findById(listing.getAgency().getId()).ifPresent(listing::setAgency);
        }
        // Adresse : on la persiste (création) ou on la met à jour (modification)
        if (listing.getAddress() != null) {
            listing.setAddress(addressRepository.save(listing.getAddress()));
        }
        // Date de publication par défaut
        if (listing.getPublicationDate() == null) {
            listing.setPublicationDate(LocalDate.now());
        }
        return listingRepository.save(listing);
    }

    public void delete(Integer id) {
        listingRepository.deleteById(id);
    }
}
