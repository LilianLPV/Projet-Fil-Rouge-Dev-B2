package com.ymmo.repository;

import com.ymmo.model.Listing;
import com.ymmo.model.ListingPicture;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ListingPictureRepository extends JpaRepository<ListingPicture, Integer> {
    List<ListingPicture> findByListing(Listing listing);
}
