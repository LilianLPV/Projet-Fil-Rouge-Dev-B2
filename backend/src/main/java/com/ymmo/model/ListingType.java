package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "listing_type")
@Data
public class ListingType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_type")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String label;
}
