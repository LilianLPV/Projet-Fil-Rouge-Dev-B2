package com.ymmo.repository;

import com.ymmo.model.Agency;
import com.ymmo.model.Listing;
import com.ymmo.model.ListingStatus;
import com.ymmo.model.ListingType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Integer> {
    List<Listing> findByAgency(Agency agency);
    List<Listing> findByType(ListingType type);
    List<Listing> findByStatus(ListingStatus status);
    List<Listing> findByAddressCity(String city);
    List<Listing> findByPriceLessThanEqual(java.math.BigDecimal maxPrice);
}
