package com.ymmo.repository;

import com.ymmo.model.ListingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ListingAddressRepository extends JpaRepository<ListingAddress, Integer> {
    List<ListingAddress> findByCity(String city);
}
