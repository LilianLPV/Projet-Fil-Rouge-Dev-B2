package com.ymmo.repository;

import com.ymmo.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationStatusRepository extends JpaRepository<ApplicationStatus, Integer> {
}
