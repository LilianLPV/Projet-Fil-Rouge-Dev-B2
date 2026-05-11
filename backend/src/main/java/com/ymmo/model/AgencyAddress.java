package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "agency_address")
@Data
public class AgencyAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_address")
    private Integer id;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(name = "zip_code", nullable = false, length = 10)
    private String zipCode;
}
