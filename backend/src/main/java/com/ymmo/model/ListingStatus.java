package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "listing_status")
@Data
public class ListingStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_status")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String label;
}
