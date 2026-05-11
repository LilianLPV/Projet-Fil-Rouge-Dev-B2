package com.ymmo.repository;

import com.ymmo.model.Agency;
import com.ymmo.model.AgencyPicture;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AgencyPictureRepository extends JpaRepository<AgencyPicture, Integer> {
    List<AgencyPicture> findByAgency(Agency agency);
}
