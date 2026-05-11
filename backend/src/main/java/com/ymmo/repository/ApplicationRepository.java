package com.ymmo.repository;

import com.ymmo.model.Application;
import com.ymmo.model.Listing;
import com.ymmo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    List<Application> findByUser(User user);
    List<Application> findByListing(Listing listing);
}
